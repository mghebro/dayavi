import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  TrendingUp,
  Activity as ActivityIcon,
  Flame,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug } = await params;

  // Fetch workspace
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    notFound();
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Queries for real-time workspace analytics and metrics
  const [
    totalTasksCount,
    completedTasksCount,
    overdueTasks,
    dueTodayTasks,
    urgentTasks,
    myAssignedTasks,
    projects,
    recentActivities,
    priorityStats,
  ] = await Promise.all([
    // Total non-archived tasks
    prisma.task.count({
      where: { project: { workspaceId: workspace.id, status: { not: "ARCHIVED" } } },
    }),
    // Completed tasks
    prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: { not: null },
      },
    }),
    // Overdue tasks
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: null,
        dueDate: { lt: startOfToday },
      },
      include: { project: true },
      take: 4,
      orderBy: { dueDate: "asc" },
    }),
    // Due today tasks
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: null,
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
      include: { project: true },
      take: 4,
      orderBy: { dueDate: "asc" },
    }),
    // Urgent priority tasks
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: null,
        priority: "URGENT",
      },
      include: { project: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    // Current user's active tasks
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        assigneeId: session.user.id,
        completedAt: null,
      },
      include: { project: true },
      take: 5,
      orderBy: { dueDate: "asc" },
    }),
    // Projects with counts
    prisma.project.findMany({
      where: { workspaceId: workspace.id, status: { not: "ARCHIVED" } },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          where: { completedAt: { not: null } },
          select: { id: true },
        },
      },
      take: 6,
      orderBy: { createdAt: "asc" },
    }),
    // Recent activities
    prisma.activity.findMany({
      where: { workspaceId: workspace.id },
      include: { actor: true, task: true, project: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    // Priority breakdown
    prisma.task.groupBy({
      by: ["priority"],
      where: { project: { workspaceId: workspace.id }, completedAt: null },
      _count: { id: true },
    }),
  ]);

  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const userName = session.user.name?.split(" ")[0] || "Friend";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ----------------------------------------------------
       * EDITORIAL GREETING & FOCUS BANNER
       * ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b-2 border-[#18181B]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FEF08A] border border-[#18181B] text-[11px] font-black text-[#18181B]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>DAILY RADAR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#18181B]">
            Good day, {userName}. Let&apos;s get things moving.
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium">
            Here is your live situational overview for <strong>{workspace.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm" className="font-bold">
            <Link href={`/app/${workspaceSlug}/my-tasks`}>My Tasks Triage</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="font-bold">
            <Link href={`/app/${workspaceSlug}/projects`}>Browse Projects</Link>
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------
       * TOP METRICS GRID (ASYMMETRIC EDITORIAL TILES)
       * ---------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] bg-white shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#71717A] uppercase tracking-wider">
            <span>Total Tasks</span>
            <Layers className="w-4 h-4 text-[#18181B]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#18181B]">{totalTasksCount}</div>
            <div className="text-[11px] text-[#71717A] mt-0.5">Across all active projects</div>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] bg-[#D1FAE5] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#166534] uppercase tracking-wider">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#166534]">{completionRate}%</div>
            <div className="text-[11px] text-[#166534]/80 mt-0.5">
              {completedTasksCount} completed tasks
            </div>
          </div>
        </div>

        {/* Metric 3: Due Today / Urgent */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] bg-[#FEF08A] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#854D0E] uppercase tracking-wider">
            <span>Due Today</span>
            <Clock className="w-4 h-4 text-[#854D0E]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#854D0E]">{dueTodayTasks.length}</div>
            <div className="text-[11px] text-[#854D0E]/80 mt-0.5">
              {urgentTasks.length} marked urgent
            </div>
          </div>
        </div>

        {/* Metric 4: Overdue Attention */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] bg-[#FEE2E2] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#DC2626] uppercase tracking-wider">
            <span>Overdue Work</span>
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#DC2626]">{overdueTasks.length}</div>
            <div className="text-[11px] text-[#DC2626]/80 mt-0.5">Requires immediate attention</div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
       * ASYMMETRIC MAIN SECTION: TODAY'S FOCUS & MY WORK
       * ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: TODAY'S FOCUS & PRIORITY BREAKDOWN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Focus Card */}
          <Card className="border-2 border-[#18181B] shadow-retro-md bg-white">
            <CardHeader className="pb-3 border-b border-[#E4E4E7] flex flex-row items-center justify-between">
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-[#FEF08A] border border-[#18181B] text-[10px] font-bold text-[#18181B] mb-1">
                  ATTENTION NEEDED
                </div>
                <CardTitle className="text-xl font-black">Today&apos;s Focus & Urgent Work</CardTitle>
              </div>
              <Flame className="w-5 h-5 text-[#FF6B4A]" />
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {overdueTasks.length === 0 && dueTodayTasks.length === 0 && urgentTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FDFBF7] border-2 border-dashed border-[#18181B]/20 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                  <p className="text-sm font-bold text-[#18181B]">No urgent or overdue tasks!</p>
                  <p className="text-xs text-[#71717A]">
                    You are completely on top of deadlines today. Great pace!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Overdue items */}
                  {overdueTasks.map((t) => (
                    <Link
                      key={t.id}
                      href={`/app/${workspaceSlug}/projects/${t.project.slug}/board?taskId=${t.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] bg-[#FFF5F5] hover:bg-[#FEE2E2] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="urgent" size="sm">
                          Overdue ({formatDate(t.dueDate)})
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A]">
                          {t.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Due Today items */}
                  {dueTodayTasks.map((t) => (
                    <Link
                      key={t.id}
                      href={`/app/${workspaceSlug}/projects/${t.project.slug}/board?taskId=${t.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] bg-[#FEFCE8] hover:bg-[#FEF08A] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="high" size="sm">
                          Due Today
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A]">
                          {t.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Urgent priority items */}
                  {urgentTasks.map((t) => (
                    <Link
                      key={t.id}
                      href={`/app/${workspaceSlug}/projects/${t.project.slug}/board?taskId=${t.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] bg-white hover:bg-[#F5F2EB] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="urgent" size="sm">
                          Urgent Priority
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A]">
                          {t.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#18181B]">Active Project Initiatives</h2>
              <Link
                href={`/app/${workspaceSlug}/projects`}
                className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1"
              >
                <span>View all projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const total = proj._count.tasks;
                const completed = proj.tasks.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Link
                    key={proj.id}
                    href={`/app/${workspaceSlug}/projects/${proj.slug}/board`}
                    className="p-4 rounded-xl border-2 border-[#18181B] bg-white shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-3 h-3 rounded-full border border-[#18181B]"
                          style={{ backgroundColor: proj.accentColor }}
                        />
                        <Badge variant="secondary" size="sm">
                          {proj.status}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-black text-[#18181B] truncate mb-1">
                        {proj.name}
                      </h3>
                      {proj.description && (
                        <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E4E4E7]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#71717A] mb-1">
                        <span>Progress</span>
                        <span>{pct}% ({completed}/{total})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F5F2EB] border border-[#18181B] overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COL: MY TASKS & RECENT ACTIVITY FEED */}
        <div className="space-y-6">
          {/* My Tasks Summary */}
          <Card className="border-2 border-[#18181B] shadow-retro bg-white">
            <CardHeader className="pb-3 border-b border-[#E4E4E7]">
              <CardTitle className="text-base font-black">Assigned to You</CardTitle>
              <CardDescription className="text-xs">Your pending action items</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {myAssignedTasks.length === 0 ? (
                <div className="text-xs text-[#71717A] italic py-4 text-center">
                  No active tasks assigned to you.
                </div>
              ) : (
                myAssignedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/app/${workspaceSlug}/projects/${task.project.slug}/board?taskId=${task.id}`}
                    className="block p-2.5 rounded-lg border border-[#E4E4E7] hover:border-[#18181B] hover:bg-[#FDFBF7] transition-all"
                  >
                    <div className="text-xs font-bold text-[#18181B] truncate mb-1">
                      {task.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                      <span className="font-semibold">{task.project.name}</span>
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-2 border-[#18181B] shadow-retro bg-[#F5F2EB]">
            <CardHeader className="pb-3 border-b border-[#18181B]">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#18181B]" />
                <CardTitle className="text-base font-black">Team Pulse</CardTitle>
              </div>
              <CardDescription className="text-xs">Latest activity in this workspace</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-xs text-[#71717A] italic py-4 text-center">
                  No recent activities logged yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#FF6B4A] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#18181B]">{act.actor.name}</span>{" "}
                      <span className="text-[#52525B]">
                        {act.action === "TASK_CREATED" && "created task"}
                        {act.action === "TASK_MOVED" && "moved task"}
                        {act.action === "TASK_UPDATED" && "updated task"}
                        {act.action === "COMMENT_ADDED" && "commented on"}
                        {act.action === "TIME_LOGGED" && "logged time on"}
                        {act.action === "PROJECT_CREATED" && "created project"}
                      </span>{" "}
                      <span className="font-semibold text-[#18181B]">
                        {act.task?.title || act.project?.name || "an item"}
                      </span>
                      <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                        {formatDate(act.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
