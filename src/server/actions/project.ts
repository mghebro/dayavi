"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { createProjectSchema, updateProjectSchema } from "@/lib/validation/schemas";
import { assertWorkspacePermission, assertProjectPermission, UnauthorizedError } from "@/lib/permissions";

export async function createProjectAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = createProjectSchema.parse(input);
  const member = await assertWorkspacePermission(validated.workspaceId, userId, "CREATE_PROJECT");

  // Check unique slug within workspace
  const existing = await prisma.project.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId: validated.workspaceId,
        slug: validated.slug,
      },
    },
  });

  if (existing) {
    return { success: false, error: "A project with this slug already exists in this workspace." };
  }

  // Atomically create project, main board, and default workflow columns
  const project = await prisma.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        workspaceId: validated.workspaceId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        status: validated.status,
        accentColor: validated.accentColor,
      },
    });

    const board = await tx.board.create({
      data: {
        projectId: newProject.id,
        name: "Main Pipeline",
        orderIndex: 1000,
      },
    });

    await tx.column.createMany({
      data: [
        { boardId: board.id, name: "Backlog", orderIndex: 1000, isCompletedColumn: false },
        { boardId: board.id, name: "Todo", orderIndex: 2000, isCompletedColumn: false },
        { boardId: board.id, name: "In Progress", orderIndex: 3000, isCompletedColumn: false },
        { boardId: board.id, name: "Done", orderIndex: 4000, isCompletedColumn: true },
      ],
    });

    await tx.activity.create({
      data: {
        workspaceId: validated.workspaceId,
        projectId: newProject.id,
        actorId: userId,
        action: "PROJECT_CREATED",
        metadata: { projectName: newProject.name },
      },
    });

    return newProject;
  });

  revalidatePath(`/app/${member.workspace.slug}/projects`);
  return { success: true, project };
}

export async function updateProjectAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = updateProjectSchema.parse(input);
  const { project, member } = await assertProjectPermission(
    validated.projectId,
    userId,
    "MANAGE_PROJECTS"
  );

  const updated = await prisma.project.update({
    where: { id: validated.projectId },
    data: {
      name: validated.name,
      description: validated.description,
      status: validated.status,
      accentColor: validated.accentColor,
    },
  });

  revalidatePath(`/app/${member.workspace.slug}/projects`);
  revalidatePath(`/app/${member.workspace.slug}/projects/${updated.slug}`);
  return { success: true, project: updated };
}

export async function deleteProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const { member } = await assertProjectPermission(projectId, userId, "MANAGE_PROJECTS");

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath(`/app/${member.workspace.slug}/projects`);
  return { success: true };
}
