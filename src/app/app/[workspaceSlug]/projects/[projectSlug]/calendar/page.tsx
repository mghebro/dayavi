import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { CalendarView } from "@/components/views/CalendarView";

export default async function ProjectCalendarPage({
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
      tasks: {
        include: {
          column: true,
        },
      },
    },
  });

  if (!project) notFound();

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
    column: { name: t.column.name },
  }));

  return (
    <CalendarView
      tasks={tasksData}
      currentUserId={session.user.id}
      activeTaskDetail={activeTaskDetail as any}
    />
  );
}
