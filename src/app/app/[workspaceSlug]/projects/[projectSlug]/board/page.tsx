import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { KanbanBoardView } from "@/components/views/KanbanBoardView";

export default async function ProjectBoardPage({
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
      workspace: true,
      boards: {
        include: {
          columns: {
            orderBy: { orderIndex: "asc" },
            include: {
              tasks: {
                orderBy: { orderIndex: "asc" },
                include: {
                  assignee: true,
                  subtasks: { select: { completed: true } },
                  blockedBy: { select: { id: true } },
                  _count: {
                    select: { subtasks: true, comments: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project || project.boards.length === 0) notFound();

  const board = project.boards[0];

  // If a taskId is selected via URL query, fetch its full detail payload
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

  const columnsData = board.columns.map((col) => ({
    id: col.id,
    name: col.name,
    orderIndex: col.orderIndex,
    wipLimit: col.wipLimit,
    isCompletedColumn: col.isCompletedColumn,
    tasks: col.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      orderIndex: t.orderIndex,
      columnId: t.columnId,
      dueDate: t.dueDate,
      startDate: t.startDate,
      totalTimeSpent: t.totalTimeSpent,
      assignee: t.assignee
        ? {
            id: t.assignee.id,
            name: t.assignee.name,
            image: t.assignee.image,
          }
        : null,
      _count: t._count,
      subtasks: t.subtasks,
      blockedBy: t.blockedBy,
    })),
  }));

  return (
    <KanbanBoardView
      columns={columnsData}
      projectId={project.id}
      boardId={board.id}
      currentUserId={session.user.id}
      activeTaskDetail={activeTaskDetail as any}
    />
  );
}
