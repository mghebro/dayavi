import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { WorkspaceSettingsClientView } from "@/components/views/WorkspaceSettingsClientView";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const userId = session.user.id;
  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!workspace) notFound();

  // Find current user's role in this workspace
  const currentMember = workspace.members.find((m) => m.userId === userId);
  if (!currentMember) notFound();

  const membersData = workspace.members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return (
    <WorkspaceSettingsClientView
      workspace={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        accentColor: workspace.accentColor,
      }}
      members={membersData}
      currentRole={currentMember.role}
      currentUserId={session.user.id}
    />
  );
}
