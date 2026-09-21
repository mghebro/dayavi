"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createSubtaskSchema,
  toggleSubtaskSchema,
  addCommentSchema,
  logTimeSchema,
  addDependencySchema,
  bulkUpdateTasksSchema,
} from "@/lib/validation/schemas";
import { calculateNewOrder } from "@/lib/ordering";
import { validateNoDependencyCycle } from "@/lib/dependencies";
import { assertProjectPermission, assertTaskPermission, UnauthorizedError } from "@/lib/permissions";
import emailService from "@/server/services/EmailService";

export async function createTaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = createTaskSchema.parse(input);
  const { member } = await assertProjectPermission(validated.projectId, userId, "CREATE_TASK");

  const orderIndex = calculateNewOrder(validated.prevOrder, validated.nextOrder);

  const task = await prisma.$transaction(async (tx) => {
    const newTask = await tx.task.create({
      data: {
        projectId: validated.projectId,
        boardId: validated.boardId,
        columnId: validated.columnId,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        assigneeId: validated.assigneeId,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        creatorId: userId,
        orderIndex,
      },
      include: {
        assignee: true,
        project: true,
      },
    });

    // Attach labels if provided
    if (validated.labelIds && validated.labelIds.length > 0) {
      await tx.taskLabel.createMany({
        data: validated.labelIds.map((labelId) => ({
          taskId: newTask.id,
          labelId,
        })),
      });
    }

    // Record activity
    await tx.activity.create({
      data: {
        workspaceId: member.workspace.id,
        projectId: validated.projectId,
        taskId: newTask.id,
        actorId: userId,
        action: "TASK_CREATED",
        metadata: { title: newTask.title },
      },
    });

    return newTask;
  });

  // If assignee exists and is not the creator, notify
  if (task.assigneeId && task.assigneeId !== userId && task.assignee?.email) {
    await prisma.notification.create({
      data: {
        userId: task.assigneeId,
        type: "TASK_ASSIGNED",
        title: "Task Assigned",
        message: `${session.user?.name || "A teammate"} assigned you to "${task.title}".`,
        linkUrl: `/app/${member.workspace.slug}/projects/${task.project.slug}/board?taskId=${task.id}`,
      },
    });

    const taskUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/${member.workspace.slug}/projects/${task.project.slug}/board?taskId=${task.id}`;
    await emailService.sendTaskAssignedEmail(
      task.assignee.email,
      task.title,
      session.user?.name || "A teammate",
      taskUrl
    );
  }

  revalidatePath(`/app/${member.workspace.slug}/projects/${task.project.slug}`);
  revalidatePath(`/app/${member.workspace.slug}/dashboard`);
  revalidatePath(`/app/${member.workspace.slug}/my-tasks`);
  return { success: true, task };
}

export async function updateTaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = updateTaskSchema.parse(input);
  const { task, member } = await assertTaskPermission(validated.taskId, userId, "EDIT_TASK");

  const updated = await prisma.task.update({
    where: { id: validated.taskId },
    data: {
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      assigneeId: validated.assigneeId,
      columnId: validated.columnId,
      startDate: validated.startDate ? new Date(validated.startDate) : validated.startDate === null ? null : undefined,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate === null ? null : undefined,
      completedAt: validated.completedAt ? new Date(validated.completedAt) : validated.completedAt === null ? null : undefined,
    },
    include: {
      project: true,
      assignee: true,
    },
  });

  await prisma.activity.create({
    data: {
      workspaceId: member.workspaceId,
      projectId: task.project.id,
      taskId: task.id,
      actorId: userId,
      action: "TASK_UPDATED",
      metadata: { changes: validated },
    },
  });

  revalidatePath(`/app/${member.workspace.slug}/projects/${updated.project.slug}`);
  revalidatePath(`/app/${member.workspace.slug}/dashboard`);
  revalidatePath(`/app/${member.workspace.slug}/my-tasks`);
  return { success: true, task: updated };
}

export async function moveTaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = moveTaskSchema.parse(input);
  const { task, member } = await assertTaskPermission(validated.taskId, userId, "MOVE_TASK");

  const targetColumn = await prisma.column.findUnique({
    where: { id: validated.targetColumnId },
  });

  if (!targetColumn) {
    return { success: false, error: "Target column not found." };
  }

  const orderIndex = calculateNewOrder(validated.prevOrder, validated.nextOrder);
  const isCompleted = targetColumn.isCompletedColumn;

  const updated = await prisma.$transaction(async (tx) => {
    const moved = await tx.task.update({
      where: { id: validated.taskId },
      data: {
        columnId: validated.targetColumnId,
        orderIndex,
        completedAt: isCompleted ? new Date() : null,
        status: targetColumn.name.toUpperCase().replace(/\s+/g, "_"),
      },
      include: { project: true },
    });

    await tx.activity.create({
      data: {
        workspaceId: member.workspaceId,
        projectId: task.project.id,
        taskId: task.id,
        actorId: userId,
        action: "TASK_MOVED",
        metadata: { toColumn: targetColumn.name },
      },
    });

    return moved;
  });

  revalidatePath(`/app/${member.workspace.slug}/projects/${updated.project.slug}`);
  revalidatePath(`/app/${member.workspace.slug}/dashboard`);
  revalidatePath(`/app/${member.workspace.slug}/my-tasks`);
  return { success: true, task: updated };
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const { task, member } = await assertTaskPermission(taskId, userId, "DELETE_TASK");

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath(`/app/${member.workspace.slug}/projects/${task.project.id}`);
  revalidatePath(`/app/${member.workspace.slug}/dashboard`);
  revalidatePath(`/app/${member.workspace.slug}/my-tasks`);
  return { success: true };
}

export async function bulkUpdateTasksAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const validated = bulkUpdateTasksSchema.parse(input);

  if (validated.action === "DELETE") {
    for (const id of validated.taskIds) {
      await deleteTaskAction(id);
    }
    return { success: true };
  }

  if (validated.action === "SET_PRIORITY" && validated.value) {
    await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: { priority: validated.value as any },
    });
  } else if (validated.action === "SET_STATUS" && validated.value) {
    await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: { status: validated.value },
    });
  } else if (validated.action === "SET_ASSIGNEE") {
    await prisma.task.updateMany({
      where: { id: { in: validated.taskIds } },
      data: { assigneeId: validated.value || null },
    });
  }

  revalidatePath("/app");
  return { success: true };
}

// ------------------------------------------------------
// SUBTASKS
// ------------------------------------------------------

export async function createSubtaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = createSubtaskSchema.parse(input);
  await assertTaskPermission(validated.taskId, userId, "EDIT_TASK");

  const orderIndex = calculateNewOrder(validated.prevOrder, validated.nextOrder);

  const subtask = await prisma.subtask.create({
    data: {
      taskId: validated.taskId,
      title: validated.title,
      orderIndex,
    },
  });

  return { success: true, subtask };
}

export async function toggleSubtaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = toggleSubtaskSchema.parse(input);
  const subtask = await prisma.subtask.findUnique({
    where: { id: validated.subtaskId },
  });

  if (!subtask) return { success: false, error: "Subtask not found" };

  await assertTaskPermission(subtask.taskId, userId, "EDIT_TASK");

  const updated = await prisma.subtask.update({
    where: { id: validated.subtaskId },
    data: { completed: validated.completed },
  });

  return { success: true, subtask: updated };
}

export async function deleteSubtaskAction(subtaskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
  });
  if (!subtask) return { success: false, error: "Subtask not found" };

  await assertTaskPermission(subtask.taskId, userId, "EDIT_TASK");

  await prisma.subtask.delete({
    where: { id: subtaskId },
  });

  return { success: true };
}

// ------------------------------------------------------
// COMMENTS
// ------------------------------------------------------

export async function addCommentAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = addCommentSchema.parse(input);
  const { task, member } = await assertTaskPermission(validated.taskId, userId, "COMMENT");

  const comment = await prisma.comment.create({
    data: {
      taskId: validated.taskId,
      authorId: userId,
      content: validated.content,
    },
    include: {
      author: true,
    },
  });

  await prisma.activity.create({
    data: {
      workspaceId: member.workspaceId,
      projectId: task.project.id,
      taskId: task.id,
      actorId: userId,
      action: "COMMENT_ADDED",
      metadata: { commentSnippet: validated.content.slice(0, 60) },
    },
  });

  return { success: true, comment };
}

// ------------------------------------------------------
// TIME TRACKING
// ------------------------------------------------------

export async function logTimeAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  const validated = logTimeSchema.parse(input);
  const { task, member } = await assertTaskPermission(validated.taskId, userId, "LOG_TIME");

  const timeEntry = await prisma.$transaction(async (tx) => {
    const entry = await tx.timeEntry.create({
      data: {
        taskId: validated.taskId,
        userId: userId,
        duration: validated.durationSeconds,
        description: validated.description,
      },
    });

    await tx.task.update({
      where: { id: validated.taskId },
      data: {
        totalTimeSpent: { increment: validated.durationSeconds },
      },
    });

    await tx.activity.create({
      data: {
        workspaceId: member.workspaceId,
        projectId: task.project.id,
        taskId: task.id,
        actorId: userId,
        action: "TIME_LOGGED",
        metadata: { durationSeconds: validated.durationSeconds },
      },
    });

    return entry;
  });

  return { success: true, timeEntry };
}

// ------------------------------------------------------
// DEPENDENCIES (WITH CYCLE DETECTION)
// ------------------------------------------------------

export async function addDependencyAction(
  input: unknown
): Promise<{ success: boolean; dependency?: any; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const validated = addDependencySchema.parse(input);
    await assertTaskPermission(validated.dependentId, userId, "EDIT_TASK");

    // Cycle check
    await validateNoDependencyCycle(validated.blockerId, validated.dependentId);

    const dependency = await prisma.taskDependency.create({
      data: {
        blockerId: validated.blockerId,
        dependentId: validated.dependentId,
      },
    });

    return { success: true, dependency };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add dependency" };
  }
}

export async function removeDependencyAction(
  dependencyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const dep = await prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    });
    if (!dep) return { success: false, error: "Dependency not found" };

    await assertTaskPermission(dep.dependentId, userId, "EDIT_TASK");

    await prisma.taskDependency.delete({
      where: { id: dependencyId },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove dependency" };
  }
}
