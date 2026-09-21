"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validation/schemas";
import { assertWorkspacePermission, UnauthorizedError } from "@/lib/permissions";
import emailService from "@/server/services/EmailService";

export async function createWorkspaceAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const validated = createWorkspaceSchema.parse(input);

  const existingSlug = await prisma.workspace.findUnique({
    where: { slug: validated.slug },
  });

  if (existingSlug) {
    return { success: false, error: "A workspace with this URL slug already exists. Please choose another." };
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      accentColor: validated.accentColor,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/app");
  return { success: true, workspace };
}

export async function updateWorkspaceAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const validated = updateWorkspaceSchema.parse(input);
  await assertWorkspacePermission(validated.workspaceId, session.user.id, "MANAGE_WORKSPACE");

  const updated = await prisma.workspace.update({
    where: { id: validated.workspaceId },
    data: {
      name: validated.name,
      description: validated.description,
      accentColor: validated.accentColor,
    },
  });

  revalidatePath(`/app/${updated.slug}`);
  return { success: true, workspace: updated };
}

export async function inviteMemberAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const validated = inviteMemberSchema.parse(input);
  const member = await assertWorkspacePermission(validated.workspaceId, session.user.id, "INVITE_MEMBERS");

  const targetEmail = validated.email.toLowerCase().trim();
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "No account found with this email. Please ask your teammate to register first.",
    };
  }

  // Check if already a member
  const existingMembership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: validated.workspaceId,
        userId: targetUser.id,
      },
    },
  });

  if (existingMembership) {
    return { success: false, error: "This user is already a member of this workspace." };
  }

  await prisma.workspaceMember.create({
    data: {
      workspaceId: validated.workspaceId,
      userId: targetUser.id,
      role: validated.role,
    },
  });

  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId: targetUser.id,
      type: "WORKSPACE_INVITE",
      title: "Workspace Invitation",
      message: `You were added to the "${member.workspace.name}" workspace as a ${validated.role}.`,
      linkUrl: `/app/${member.workspace.slug}/dashboard`,
    },
  });

  // Send invitation email in background
  const inviterName = session.user.name || "A teammate";
  const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/${member.workspace.slug}/dashboard`;
  await emailService.sendWorkspaceInviteEmail(targetEmail, member.workspace.name, inviterName, inviteUrl);

  revalidatePath(`/app/${member.workspace.slug}/settings`);
  return { success: true };
}

export async function updateMemberRoleAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const validated = updateMemberRoleSchema.parse(input);
  const actor = await assertWorkspacePermission(validated.workspaceId, session.user.id, "CHANGE_MEMBER_ROLES");

  const targetMembership = await prisma.workspaceMember.findUnique({
    where: { id: validated.memberId },
  });

  if (!targetMembership) {
    return { success: false, error: "Member not found." };
  }

  // Admin cannot change owner's role
  if (targetMembership.role === "OWNER" && actor.role !== "OWNER") {
    return { success: false, error: "Only the workspace owner can modify an owner's role." };
  }

  await prisma.workspaceMember.update({
    where: { id: validated.memberId },
    data: { role: validated.role },
  });

  revalidatePath(`/app/${actor.workspace.slug}/settings`);
  return { success: true };
}

export async function removeMemberAction(workspaceId: string, memberId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const actor = await assertWorkspacePermission(workspaceId, session.user.id, "REMOVE_MEMBERS");

  const target = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
  });

  if (!target) return { success: false, error: "Member record not found." };
  if (target.role === "OWNER") {
    return { success: false, error: "Cannot remove the workspace owner." };
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  revalidatePath(`/app/${actor.workspace.slug}/settings`);
  return { success: true };
}

export async function deleteWorkspaceAction(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  await assertWorkspacePermission(workspaceId, session.user.id, "DELETE_WORKSPACE");

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  revalidatePath("/app");
  return { success: true };
}
