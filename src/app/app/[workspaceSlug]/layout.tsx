import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

export default async function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ workspaceSlug: string }>;
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceSlug } = await params;

  // 1. Fetch current workspace and verify user membership
  const currentWorkspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      members: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!currentWorkspace || currentWorkspace.members.length === 0) {
    notFound();
  }

  // 2. Fetch all workspaces the user belongs to (for workspace switcher)
  const userMemberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  const workspaces = userMemberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    accentColor: m.workspace.accentColor,
    role: m.role,
  }));

  // 3. Fetch projects for this workspace with their boards and columns (for quick task modal & navigation)
  const projects = await prisma.project.findMany({
    where: {
      workspaceId: currentWorkspace.id,
      status: { not: "ARCHIVED" },
    },
    include: {
      boards: {
        include: {
          columns: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 4. Fetch unread notifications count
  const unreadNotificationsCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  return (
    <WorkspaceShell
      currentWorkspace={{
        id: currentWorkspace.id,
        name: currentWorkspace.name,
        slug: currentWorkspace.slug,
        accentColor: currentWorkspace.accentColor,
      }}
      workspaces={workspaces}
      projects={projects}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      unreadNotificationsCount={unreadNotificationsCount}
    >
      {children}
    </WorkspaceShell>
  );
}
