import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { MyTasksClientView } from "@/components/views/MyTasksClientView";

export default async function MyTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ taskId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug } = await params;
  const { taskId } = await searchParams;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!workspace || workspace.members.length === 0) notFound();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Fetch all tasks assigned to the current user in this workspace
  const tasks = await prisma.task.findMany({
    where: {
      project: { workspaceId: workspace.id, status: { not: "ARCHIVED" } },
      assigneeId: session.user.id,
    },
    include: {
      project: { select: { id: true, name: true, slug: true, accentColor: true } },
      column: { select: { id: true, name: true, isCompletedColumn: true } },
      subtasks: { select: { completed: true } },
    },
    orderBy: [{ completedAt: "asc" }, { dueDate: "asc" }],
  });

  // Fetch active task details if query param present
  let activeTaskDetail = null;
  if (taskId) {
    activeTaskDetail = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: true,
            tasks: { select: { id: true, title: true } },
          },
        },
        board: {
          include: {
            columns: { select: { id: true, name: true } },
          },
        },
        column: true,
        creator: true,
        assignee: true,
        subtasks: { orderBy: { orderIndex: "asc" } },
        labels: { include: { label: true } },
        comments: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
        timeEntries: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        blockedBy: {
          include: {
            blocker: { select: { id: true, title: true, status: true } },
          },
        },
        blocking: {
          include: {
            dependent: { select: { id: true, title: true, status: true } },
          },
        },
        activities: {
          include: { actor: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  // Group tasks
  const overdue: any[] = [];
  const today: any[] = [];
  const upcoming: any[] = [];
  const completed: any[] = [];

  for (const t of tasks) {
    if (t.completedAt != null || t.column.isCompletedColumn) {
      completed.push(t);
    } else if (t.dueDate && new Date(t.dueDate) < startOfToday) {
      overdue.push(t);
    } else if (t.dueDate && new Date(t.dueDate) <= endOfToday) {
      today.push(t);
    } else {
      upcoming.push(t);
    }
  }

  return (
    <MyTasksClientView
      overdue={overdue}
      today={today}
      upcoming={upcoming}
      completed={completed}
      workspaceSlug={workspaceSlug}
      currentUserId={session.user.id}
      activeTaskDetail={activeTaskDetail as any}
    />
  );
}
