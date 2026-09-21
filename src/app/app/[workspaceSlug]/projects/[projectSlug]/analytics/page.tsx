import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export default async function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug, projectSlug } = await params;

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      workspace: {
        slug: workspaceSlug,
        members: { some: { userId: session.user.id } },
      },
    },
    include: {
      boards: {
        include: {
          columns: {
            include: {
              _count: { select: { tasks: true } },
            },
          },
        },
      },
      tasks: {
        include: {
          assignee: true,
        },
      },
    },
  });

  if (!project) notFound();

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completedAt != null).length;
  const openTasks = totalTasks - completedTasks;
  const overdueTasks = project.tasks.filter(
    (t) => t.completedAt == null && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const completionPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Cumulative time spent across all tasks in this project
  const totalSeconds = project.tasks.reduce((acc, t) => acc + t.totalTimeSpent, 0);

  // Tasks by priority
  const priorityCounts = {
    URGENT: project.tasks.filter((t) => t.priority === "URGENT").length,
    HIGH: project.tasks.filter((t) => t.priority === "HIGH").length,
    MEDIUM: project.tasks.filter((t) => t.priority === "MEDIUM").length,
    LOW: project.tasks.filter((t) => t.priority === "LOW").length,
    NONE: project.tasks.filter((t) => t.priority === "NONE").length,
  };

  // Tasks by column
  const columns = project.boards[0]?.columns || [];

  // Member workload
  const memberWorkload: Record<string, { name: string; count: number }> = {};
  for (const t of project.tasks) {
    if (t.completedAt == null) {
      const name = t.assignee?.name || "Unassigned";
      if (!memberWorkload[name]) memberWorkload[name] = { name, count: 0 };
      memberWorkload[name].count += 1;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border-2 border-[#18181B] bg-white shadow-retro">
          <div className="text-[10px] font-black text-[#71717A] uppercase">Total Tasks</div>
          <div className="text-2xl font-black text-[#18181B] mt-1">{totalTasks}</div>
          <div className="text-[10px] text-[#71717A] mt-0.5">{openTasks} currently open</div>
        </div>

        <div className="p-4 rounded-xl border-2 border-[#18181B] bg-[#D1FAE5] shadow-retro">
          <div className="text-[10px] font-black text-[#166534] uppercase">Completion Rate</div>
          <div className="text-2xl font-black text-[#166534] mt-1">{completionPct}%</div>
          <div className="text-[10px] text-[#166534]/80 mt-0.5">{completedTasks} completed</div>
        </div>

        <div className="p-4 rounded-xl border-2 border-[#18181B] bg-[#FEF08A] shadow-retro">
          <div className="text-[10px] font-black text-[#854D0E] uppercase">Overdue Tasks</div>
          <div className="text-2xl font-black text-[#854D0E] mt-1">{overdueTasks}</div>
          <div className="text-[10px] text-[#854D0E]/80 mt-0.5">Requiring attention</div>
        </div>

        <div className="p-4 rounded-xl border-2 border-[#18181B] bg-[#E0D8FF] shadow-retro">
          <div className="text-[10px] font-black text-[#6B21A8] uppercase">Tracked Time</div>
          <div className="text-2xl font-black text-[#6B21A8] mt-1">{formatDuration(totalSeconds)}</div>
          <div className="text-[10px] text-[#6B21A8]/80 mt-0.5">Total stopwatch duration</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Pipeline Distribution */}
        <Card className="border-2 border-[#18181B] shadow-retro bg-white">
          <CardHeader className="pb-3 border-b border-[#E4E4E7]">
            <CardTitle className="text-base font-black">Column Distribution</CardTitle>
            <CardDescription className="text-xs">Task accumulation across workflow stages</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {columns.map((col) => {
              const count = col._count.tasks;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={col.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{col.name}</span>
                    <span className="text-[#71717A]">
                      {count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#F5F2EB] border border-[#18181B] overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B4A] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-2 border-[#18181B] shadow-retro bg-white">
          <CardHeader className="pb-3 border-b border-[#E4E4E7]">
            <CardTitle className="text-base font-black">Priority Breakdown</CardTitle>
            <CardDescription className="text-xs">Work distribution by urgency level</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { label: "Urgent", count: priorityCounts.URGENT, color: "bg-[#FF6B4A]", badge: "urgent" },
              { label: "High", count: priorityCounts.HIGH, color: "bg-[#FEF08A]", badge: "high" },
              { label: "Medium", count: priorityCounts.MEDIUM, color: "bg-[#E0D8FF]", badge: "medium" },
              { label: "Low", count: priorityCounts.LOW, color: "bg-[#D1FAE5]", badge: "low" },
              { label: "No Priority", count: priorityCounts.NONE, color: "bg-white", badge: "none" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#18181B] bg-[#FDFBF7]"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={item.badge as any} size="sm">
                    {item.label}
                  </Badge>
                </div>
                <span className="text-xs font-black text-[#18181B]">
                  {item.count} {item.count === 1 ? "task" : "tasks"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Member Workload */}
      <Card className="border-2 border-[#18181B] shadow-retro bg-white">
        <CardHeader className="pb-3 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#18181B]" />
            <CardTitle className="text-base font-black">Active Workload Allocation</CardTitle>
          </div>
          <CardDescription className="text-xs">Open tasks currently assigned per teammate</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {Object.keys(memberWorkload).length === 0 ? (
            <div className="text-xs text-[#71717A] italic py-2">No active assignments.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(memberWorkload).map((member) => (
                <div
                  key={member.name}
                  className="p-3.5 rounded-xl border-2 border-[#18181B] bg-[#FDFBF7] shadow-retro-sm flex items-center justify-between"
                >
                  <div className="text-xs font-bold text-[#18181B] truncate">{member.name}</div>
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-white border border-[#18181B]">
                    {member.count} open
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
