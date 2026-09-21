import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export default async function AppRootPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Look up user's active workspaces
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  if (membership?.workspace?.slug) {
    redirect(`/app/${membership.workspace.slug}/dashboard`);
  }

  // If user has no workspace yet, create a default one
  const userName = session.user.name || "My";
  const baseSlug = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "workspace";
  const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

  const newWorkspace = await prisma.workspace.create({
    data: {
      name: `${userName}'s Workspace`,
      slug: uniqueSlug,
      ownerId: session.user.id,
      accentColor: "#8B5CF6",
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
      projects: {
        create: {
          name: "Getting Started",
          slug: "getting-started",
          description: "Welcome to Dayavi! Your creative project workflow.",
          status: "ACTIVE",
          accentColor: "#FF6B4A",
          boards: {
            create: {
              name: "Sprint Pipeline",
              orderIndex: 1000,
              columns: {
                create: [
                  { name: "Backlog", orderIndex: 1000 },
                  { name: "Todo", orderIndex: 2000 },
                  { name: "In Progress", orderIndex: 3000 },
                  { name: "Done", orderIndex: 4000, isCompletedColumn: true },
                ],
              },
            },
          },
        },
      },
    },
  });

  redirect(`/app/${newWorkspace.slug}/dashboard`);
}
