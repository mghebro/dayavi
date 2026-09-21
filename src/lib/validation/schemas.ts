import { z } from "zod";
import { ProjectStatus, TaskPriority, WorkspaceRole } from "@prisma/client";

// ------------------------------------------------------
// 1. AUTHENTICATION SCHEMAS
// ------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(64),
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ------------------------------------------------------
// 2. WORKSPACE SCHEMAS
// ------------------------------------------------------

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes"),
  description: z.string().max(250).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex code").default("#8B5CF6"),
});

export const updateWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(250).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.nativeEnum(WorkspaceRole),
});

// ------------------------------------------------------
// 3. PROJECT SCHEMAS
// ------------------------------------------------------

export const createProjectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2, "Project name must be at least 2 characters").max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes"),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#FF6B4A"),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// ------------------------------------------------------
// 4. BOARD & COLUMN SCHEMAS
// ------------------------------------------------------

export const createBoardSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
});

export const createColumnSchema = z.object({
  boardId: z.string().min(1),
  name: z.string().min(1).max(50),
  wipLimit: z.number().int().positive().nullable().optional(),
  isCompletedColumn: z.boolean().default(false),
  prevOrder: z.number().nullable().optional(),
  nextOrder: z.number().nullable().optional(),
});

export const reorderColumnSchema = z.object({
  columnId: z.string().min(1),
  prevOrder: z.number().nullable().optional(),
  nextOrder: z.number().nullable().optional(),
});

// ------------------------------------------------------
// 5. TASK SCHEMAS
// ------------------------------------------------------

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  boardId: z.string().min(1),
  columnId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(10000).optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NONE),
  assigneeId: z.string().nullable().optional(),
  startDate: z.string().datetime({ offset: true }).nullable().optional().or(z.date().nullable().optional()),
  dueDate: z.string().datetime({ offset: true }).nullable().optional().or(z.date().nullable().optional()),
  prevOrder: z.number().nullable().optional(),
  nextOrder: z.number().nullable().optional(),
  labelIds: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).nullable().optional(),
  status: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().nullable().optional(),
  columnId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).nullable().optional().or(z.date().nullable().optional()),
  dueDate: z.string().datetime({ offset: true }).nullable().optional().or(z.date().nullable().optional()),
  completedAt: z.string().datetime({ offset: true }).nullable().optional().or(z.date().nullable().optional()),
});

export const moveTaskSchema = z.object({
  taskId: z.string().min(1),
  targetColumnId: z.string().min(1),
  prevOrder: z.number().nullable().optional(),
  nextOrder: z.number().nullable().optional(),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, "Select at least one task"),
  action: z.enum(["SET_STATUS", "SET_PRIORITY", "SET_ASSIGNEE", "DELETE"]),
  value: z.string().nullable().optional(),
});

// ------------------------------------------------------
// 6. SUBTASK & COLLABORATION SCHEMAS
// ------------------------------------------------------

export const createSubtaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1).max(200),
  prevOrder: z.number().nullable().optional(),
  nextOrder: z.number().nullable().optional(),
});

export const toggleSubtaskSchema = z.object({
  subtaskId: z.string().min(1),
  completed: z.boolean(),
});

export const addCommentSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const logTimeSchema = z.object({
  taskId: z.string().min(1),
  durationSeconds: z.number().int().positive("Duration must be positive"),
  description: z.string().max(250).optional(),
});

export const addDependencySchema = z.object({
  blockerId: z.string().min(1),
  dependentId: z.string().min(1),
});
