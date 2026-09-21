import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { NotificationsClientView } from "@/components/views/NotificationsClientView";

export default async function NotificationsPage({
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

  if (!workspace || workspace.members.length === 0) notFound();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayNotifications = notifications.filter((n) => new Date(n.createdAt) >= startOfToday);
  const earlierNotifications = notifications.filter((n) => new Date(n.createdAt) < startOfToday);

  return (
    <NotificationsClientView
      today={todayNotifications}
      earlier={earlierNotifications}
      workspaceSlug={workspaceSlug}
    />
  );
}
