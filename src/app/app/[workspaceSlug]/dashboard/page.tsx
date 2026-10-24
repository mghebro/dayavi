import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { DashboardClientView } from "@/components/views/DashboardClientView";

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
      include: {
        project: { select: { slug: true, name: true } },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    }),
    // Tasks due today
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: null,
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        project: { select: { slug: true, name: true } },
      },
      take: 5,
      orderBy: { priority: "desc" },
    }),
    // Urgent tasks
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        completedAt: null,
        priority: "URGENT",
      },
      include: {
        project: { select: { slug: true, name: true } },
      },
      take: 5,
    }),
    // Tasks assigned to current user
    prisma.task.findMany({
      where: {
        project: { workspaceId: workspace.id },
        assigneeId: session.user.id,
        completedAt: null,
      },
      include: {
        project: { select: { slug: true, name: true } },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    }),
    // Active projects overview
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
      orderBy: { updatedAt: "desc" },
    }),
    // Recent activity feed
    prisma.activity.findMany({
      where: { workspaceId: workspace.id },
      include: {
        actor: { select: { name: true } },
        task: { select: { title: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const completionRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  const userName = session.user.name || "Colleague";

  return (
    <DashboardClientView
      workspace={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      }}
      userName={userName}
      totalTasksCount={totalTasksCount}
      completedTasksCount={completedTasksCount}
      completionRate={completionRate}
      dueTodayTasks={dueTodayTasks}
      urgentTasks={urgentTasks}
      overdueTasks={overdueTasks}
      myAssignedTasks={myAssignedTasks}
      projects={projects}
      recentActivities={recentActivities}
    />
  );
}
