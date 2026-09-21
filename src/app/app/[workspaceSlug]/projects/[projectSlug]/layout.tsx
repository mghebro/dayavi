import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  Kanban,
  ListTodo,
  CalendarDays,
  BarChart3,
  Settings,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectHeaderTabs } from "@/components/projects/ProjectHeaderTabs";

export default async function ProjectLayout({
  params,
  children,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug, projectSlug } = await params;

  // Query workspace & project
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      workspace: {
        slug: workspaceSlug,
        members: { some: { userId: session.user.id } },
      },
    },
    include: {
      workspace: true,
      _count: { select: { tasks: true } },
      tasks: {
        where: { completedAt: { not: null } },
        select: { id: true },
      },
    },
  });

  if (!project) notFound();

  const totalTasks = project._count.tasks;
  const completedTasks = project.tasks.length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* ----------------------------------------------------
       * PROJECT HEADER
       * ---------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border-2 border-[#18181B] shadow-retro space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-md border-2 border-[#18181B] shadow-retro-sm shrink-0 mt-1"
              style={{ backgroundColor: project.accentColor }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B]">
                  {project.name}
                </h1>
                <Badge variant="secondary" size="sm">
                  {project.status}
                </Badge>
              </div>
              {project.description && (
                <p className="text-xs text-[#52525B] font-medium max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-[#71717A]">Progress</div>
              <div className="text-sm font-black text-[#18181B]">
                {pct}% ({completedTasks}/{totalTasks})
              </div>
            </div>
            <div className="w-24 h-2.5 rounded-full bg-[#F5F2EB] border border-[#18181B] overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
         * 5-WAY VIEW SWITCHER TABS
         * ---------------------------------------------------- */}
        <div className="pt-2 border-t border-[#E4E4E7]">
          <ProjectHeaderTabs
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
          />
        </div>
      </div>

      {/* View Content */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
