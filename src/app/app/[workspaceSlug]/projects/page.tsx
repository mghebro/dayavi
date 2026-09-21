import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { Plus, FolderKanban, ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProjectsDirectoryPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    notFound();
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      _count: { select: { tasks: true, members: true } },
      tasks: {
        where: { completedAt: { not: null } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#18181B]">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#E0D8FF] border border-[#18181B] text-[11px] font-black text-[#18181B] mb-1">
            WORK INITIATIVES
          </div>
          <h1 className="text-3xl font-black text-[#18181B] tracking-tight">Projects</h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium">
            Explore and coordinate all initiatives in <strong>{workspace.name}</strong>.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const totalTasks = proj._count.tasks;
          const completedTasks = proj.tasks.length;
          const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <Link
              key={proj.id}
              href={`/app/${workspaceSlug}/projects/${proj.slug}/board`}
              className="group p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-[#18181B] shadow-retro-sm"
                    style={{ backgroundColor: proj.accentColor }}
                  />
                  <Badge variant="secondary" size="sm">
                    {proj.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-black text-[#18181B] group-hover:text-[#FF6B4A] transition-colors mb-2">
                  {proj.name}
                </h3>

                <p className="text-xs text-[#52525B] leading-relaxed line-clamp-3 mb-4 font-medium">
                  {proj.description || "No project description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#71717A]">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{totalTasks} tasks</span>
                  </span>
                  <span>{pct}% complete</span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#F5F2EB] border border-[#18181B] overflow-hidden">
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
  );
}
