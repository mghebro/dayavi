import { WorkspaceRole } from "@prisma/client";
import prisma from "./db/prisma";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to perform this action.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have sufficient permissions to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "The requested resource was not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export type Permission =
  | "MANAGE_WORKSPACE"
  | "DELETE_WORKSPACE"
  | "INVITE_MEMBERS"
  | "REMOVE_MEMBERS"
  | "CHANGE_MEMBER_ROLES"
  | "CREATE_PROJECT"
  | "MANAGE_PROJECTS"
  | "MANAGE_BOARDS"
  | "CREATE_TASK"
  | "EDIT_TASK"
  | "DELETE_TASK"
  | "MOVE_TASK"
  | "COMMENT"
  | "LOG_TIME"
  | "VIEW";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<Permission>> = {
  OWNER: new Set([
    "MANAGE_WORKSPACE",
    "DELETE_WORKSPACE",
    "INVITE_MEMBERS",
    "REMOVE_MEMBERS",
    "CHANGE_MEMBER_ROLES",
    "CREATE_PROJECT",
    "MANAGE_PROJECTS",
    "MANAGE_BOARDS",
    "CREATE_TASK",
    "EDIT_TASK",
    "DELETE_TASK",
    "MOVE_TASK",
    "COMMENT",
    "LOG_TIME",
    "VIEW",
  ]),
  ADMIN: new Set([
    "MANAGE_WORKSPACE",
    "INVITE_MEMBERS",
    "REMOVE_MEMBERS",
    "CHANGE_MEMBER_ROLES",
    "CREATE_PROJECT",
    "MANAGE_PROJECTS",
    "MANAGE_BOARDS",
    "CREATE_TASK",
    "EDIT_TASK",
    "DELETE_TASK",
    "MOVE_TASK",
    "COMMENT",
    "LOG_TIME",
    "VIEW",
  ]),
  MEMBER: new Set([
    "CREATE_TASK",
    "EDIT_TASK",
    "DELETE_TASK",
    "MOVE_TASK",
    "COMMENT",
    "LOG_TIME",
    "VIEW",
  ]),
  VIEWER: new Set(["VIEW"]),
};

/**
 * Checks if a specific role possesses a permission.
 */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Asserts that a user has membership in a workspace and holds the required permission.
 */
export async function assertWorkspacePermission(
  workspaceId: string,
  userId: string,
  permission: Permission
) {
  if (!userId) throw new UnauthorizedError();

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!member) {
    throw new ForbiddenError("You are not a member of this workspace.");
  }

  if (!hasPermission(member.role, permission)) {
    throw new ForbiddenError(`Role ${member.role} lacks capability: ${permission}`);
  }

  return member;
}

/**
 * Asserts that a user has permission to access and mutate a project.
 */
export async function assertProjectPermission(
  projectId: string,
  userId: string,
  permission: Permission
) {
  if (!userId) throw new UnauthorizedError();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, status: true },
  });

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  const member = await assertWorkspacePermission(project.workspaceId, userId, permission);
  return { project, member };
}

/**
 * Asserts that a user has permission to access and mutate a task.
 * Enforces that normal members can only delete tasks that they created.
 */
export async function assertTaskPermission(
  taskId: string,
  userId: string,
  permission: Permission
) {
  if (!userId) throw new UnauthorizedError();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, workspaceId: true },
      },
    },
  });

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  const member = await assertWorkspacePermission(task.project.workspaceId, userId, permission);

  // Author-specific override for task deletion:
  if (permission === "DELETE_TASK" && member.role === "MEMBER") {
    if (task.creatorId !== userId) {
      throw new ForbiddenError("Members may only delete tasks that they personally created.");
    }
  }

  return { task, member };
}
