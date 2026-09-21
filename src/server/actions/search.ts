"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { assertWorkspacePermission, UnauthorizedError } from "@/lib/permissions";

export interface SearchResults {
  tasks: Array<{ id: string; title: string; projectSlug: string; priority: string; status: string }>;
  projects: Array<{ id: string; name: string; slug: string; status: string; accentColor: string }>;
  boards: Array<{ id: string; name: string; projectSlug: string }>;
  labels: Array<{ id: string; name: string; color: string }>;
}

export async function globalSearchAction(
  query: string,
  workspaceId: string
): Promise<{ success: boolean; data?: SearchResults; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) {
    return {
      success: true,
      data: { tasks: [], projects: [], boards: [], labels: [] },
    };
  }

  await assertWorkspacePermission(workspaceId, session.user.id, "VIEW");

  const [tasks, projects, boards, labels] = await Promise.all([
    prisma.task.findMany({
      where: {
        project: { workspaceId },
        title: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        project: { select: { slug: true } },
      },
      take: 8,
    }),
    prisma.project.findMany({
      where: {
        workspaceId,
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        accentColor: true,
      },
      take: 5,
    }),
    prisma.board.findMany({
      where: {
        project: { workspaceId },
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        project: { select: { slug: true } },
      },
      take: 4,
    }),
    prisma.label.findMany({
      where: {
        workspaceId,
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      take: 4,
    }),
  ]);

  return {
    success: true,
    data: {
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        projectSlug: t.project.slug,
        priority: t.priority,
        status: t.status,
      })),
      projects,
      boards: boards.map((b) => ({
        id: b.id,
        name: b.name,
        projectSlug: b.project.slug,
      })),
      labels,
    },
  };
}
