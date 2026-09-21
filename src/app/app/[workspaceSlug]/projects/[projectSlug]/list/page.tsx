import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { TaskListView } from "@/components/views/TaskListView";

export default async function ProjectListPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
  searchParams: Promise<{ taskId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { workspaceSlug, projectSlug } = await params;
  const { taskId } = await searchParams;

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
          columns: { orderBy: { orderIndex: "asc" } },
        },
      },
      tasks: {
        orderBy: { orderIndex: "asc" },
        include: {
          column: true,
          assignee: true,
          subtasks: { select: { completed: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
      },
    },
  });

  if (!project || project.boards.length === 0) notFound();

  const columns = project.boards[0].columns.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // Fetch active task detail payload if taskId query param exists
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

  const tasksData = project.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    startDate: t.startDate,
    totalTimeSpent: t.totalTimeSpent,
    column: { id: t.column.id, name: t.column.name },
    assignee: t.assignee
      ? {
          id: t.assignee.id,
          name: t.assignee.name,
          image: t.assignee.image,
        }
      : null,
    _count: t._count,
    subtasks: t.subtasks,
  }));

  return (
    <TaskListView
      tasks={tasksData}
      columns={columns}
      currentUserId={session.user.id}
      activeTaskDetail={activeTaskDetail as any}
    />
  );
}
