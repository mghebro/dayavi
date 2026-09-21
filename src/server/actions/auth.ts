"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from "@/lib/validation/schemas";
import emailService from "@/server/services/EmailService";
import { signOut } from "@/lib/auth/auth";

export async function registerUser(input: unknown) {
  const result = registerSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Invalid input." };
  }

  const { name, email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate unique workspace slug from user's name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "my-workspace";
  const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

  // Create user and initial workspace atomically in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        hashedPassword,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug: uniqueSlug,
        ownerId: newUser.id,
        accentColor: "#8B5CF6",
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: newUser.id,
        role: "OWNER",
      },
    });

    // Create a starter project with board and default columns
    const project = await tx.project.create({
      data: {
        workspaceId: workspace.id,
        name: "Welcome Project",
        slug: "welcome-project",
        description: "Your first project in Dayavi (დაყავი). Divide and conquer!",
        status: "ACTIVE",
        accentColor: "#FF6B4A",
      },
    });

    const board = await tx.board.create({
      data: {
        projectId: project.id,
        name: "Main Pipeline",
        orderIndex: 1000,
      },
    });

    const columns = [
      { name: "Backlog", orderIndex: 1000, isCompletedColumn: false },
      { name: "Todo", orderIndex: 2000, isCompletedColumn: false },
      { name: "In Progress", orderIndex: 3000, isCompletedColumn: false },
      { name: "Done", orderIndex: 4000, isCompletedColumn: true },
    ];

    const createdColumns = [];
    for (const col of columns) {
      const createdCol = await tx.column.create({
        data: {
          boardId: board.id,
          name: col.name,
          orderIndex: col.orderIndex,
          isCompletedColumn: col.isCompletedColumn,
        },
      });
      createdColumns.push(createdCol);
    }

    // Create a starter welcome task
    const todoCol = createdColumns.find((c) => c.name === "Todo") || createdColumns[0];
    const task = await tx.task.create({
      data: {
        projectId: project.id,
        boardId: board.id,
        columnId: todoCol.id,
        title: "Explore Dayavi (დაყავი)",
        description: "Welcome to Dayavi! Try dragging this task across columns, clicking to open details, or adding checklist subtasks.",
        priority: "HIGH",
        creatorId: newUser.id,
        assigneeId: newUser.id,
        orderIndex: 1000,
      },
    });

    await tx.subtask.createMany({
      data: [
        { taskId: task.id, title: "Test Kanban drag and drop", completed: false, orderIndex: 1000 },
        { taskId: task.id, title: "Switch to List and Calendar views", completed: false, orderIndex: 2000 },
        { taskId: task.id, title: "Open Command Palette (Cmd + K)", completed: false, orderIndex: 3000 },
      ],
    });

    return newUser;
  });

  // Generate verification token and dispatch email in background
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires,
    },
  });

  await emailService.sendVerificationEmail(normalizedEmail, token);

  return { success: true, userId: user.id };
}

export async function requestPasswordReset(input: unknown) {
  const result = forgotPasswordSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: "Please enter a valid email." };
  }

  const { email } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  // To prevent user enumeration, always return success message
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    await emailService.sendPasswordResetEmail(normalizedEmail, token);
  }

  return {
    success: true,
    message: "If an account exists with that email, a password reset link has been dispatched.",
  };
}

export async function resetPassword(input: unknown) {
  const result = resetPasswordSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Invalid input." };
  }

  const { token, password } = result.data;

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.expires < new Date()) {
    return { success: false, error: "Invalid or expired password reset link. Please request a new one." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: resetRecord.email },
      data: { hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { email: resetRecord.email },
    }),
  ]);

  return { success: true, message: "Password updated successfully. You may now log in." };
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
