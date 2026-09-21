import { PrismaClient, WorkspaceRole, ProjectStatus, TaskPriority, ActivityAction, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Dayavi database seed...");

  // Clean existing seed data in correct cascade order
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.label.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const demoPassword = await bcrypt.hash("Dayavi2026!", 12);

  // 1. Create Demo Users
  console.log("Creating demo users...");
  const giorgi = await prisma.user.create({
    data: {
      name: "Giorgi Mgebrishvili",
      email: "giorgi@dayavi.app",
      hashedPassword: demoPassword,
      emailVerified: new Date(),
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@dayavi.app",
      hashedPassword: demoPassword,
      emailVerified: new Date(),
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: "Maria Chen",
      email: "maria@dayavi.app",
      hashedPassword: demoPassword,
      emailVerified: new Date(),
    },
  });

  const david = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "david@dayavi.app",
      hashedPassword: demoPassword,
      emailVerified: new Date(),
    },
  });

  // 2. Create Workspace
  console.log("Creating workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      name: "Dayavi Studio",
      slug: "dayavi-studio",
      description: "Primary creative engineering and product workspace. Divide and conquer!",
      ownerId: giorgi.id,
      accentColor: "#8B5CF6",
    },
  });

  // 3. Add Members with Distinct Roles
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: giorgi.id, role: WorkspaceRole.OWNER },
      { workspaceId: workspace.id, userId: alex.id, role: WorkspaceRole.ADMIN },
      { workspaceId: workspace.id, userId: maria.id, role: WorkspaceRole.MEMBER },
      { workspaceId: workspace.id, userId: david.id, role: WorkspaceRole.VIEWER },
    ],
  });

  // 4. Create Workspace Labels
  const labelDesign = await prisma.label.create({
    data: { workspaceId: workspace.id, name: "Design", color: "#FF6B4A" },
  });
  const labelFrontend = await prisma.label.create({
    data: { workspaceId: workspace.id, name: "Frontend", color: "#8B5CF6" },
  });
  const labelBackend = await prisma.label.create({
    data: { workspaceId: workspace.id, name: "Backend", color: "#3B82F6" },
  });
  const labelDevOps = await prisma.label.create({
    data: { workspaceId: workspace.id, name: "DevOps", color: "#10B981" },
  });
  const labelUrgent = await prisma.label.create({
    data: { workspaceId: workspace.id, name: "Urgent", color: "#EF4444" },
  });

  // 5. Create Projects across statuses
  console.log("Creating projects & boards...");
  const projCoreApp = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "Core Web Platform v2",
      slug: "core-platform-v2",
      description: "Next.js 16 full-stack architecture, high-density views, and performance hardening.",
      status: ProjectStatus.ACTIVE,
      accentColor: "#FF6B4A",
    },
  });

  const projDesignSystem = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "Playful Editorial Design System",
      slug: "editorial-design-system",
      description: "Warm paper tokens, tactile retro shadows, and soft neo-brutalist component library.",
      status: ProjectStatus.ACTIVE,
      accentColor: "#8B5CF6",
    },
  });

  const projMobile = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "Mobile Native Experience",
      slug: "mobile-experience",
      description: "Responsive touch-friendly Kanban navigation and offline triage mode.",
      status: ProjectStatus.PLANNING,
      accentColor: "#10B981",
    },
  });

  const projQ3Milestone = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "Q3 Product Launch",
      slug: "q3-product-launch",
      description: "Public release marketing campaign and infrastructure scaling.",
      status: ProjectStatus.COMPLETED,
      accentColor: "#3B82F6",
    },
  });

  // 6. Create Boards and Columns for Core Platform
  const coreBoard = await prisma.board.create({
    data: {
      projectId: projCoreApp.id,
      name: "Engineering Sprint",
      orderIndex: 1000,
    },
  });

  const colBacklog = await prisma.column.create({
    data: { boardId: coreBoard.id, name: "Backlog", orderIndex: 1000, isCompletedColumn: false },
  });
  const colTodo = await prisma.column.create({
    data: { boardId: coreBoard.id, name: "Todo", orderIndex: 2000, isCompletedColumn: false },
  });
  const colInProgress = await prisma.column.create({
    data: { boardId: coreBoard.id, name: "In Progress", orderIndex: 3000, wipLimit: 4, isCompletedColumn: false },
  });
  const colReview = await prisma.column.create({
    data: { boardId: coreBoard.id, name: "Review", orderIndex: 4000, isCompletedColumn: false },
  });
  const colDone = await prisma.column.create({
    data: { boardId: coreBoard.id, name: "Done", orderIndex: 5000, isCompletedColumn: true },
  });

  // Columns for Design System Project
  const designBoard = await prisma.board.create({
    data: {
      projectId: projDesignSystem.id,
      name: "Design Workflow",
      orderIndex: 1000,
    },
  });
  const dColTodo = await prisma.column.create({
    data: { boardId: designBoard.id, name: "Concepts", orderIndex: 1000 },
  });
  const dColActive = await prisma.column.create({
    data: { boardId: designBoard.id, name: "In Design", orderIndex: 2000 },
  });
  const dColDone = await prisma.column.create({
    data: { boardId: designBoard.id, name: "Approved", orderIndex: 3000, isCompletedColumn: true },
  });

  // Dates for deadlines
  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (overdue)
  const todayDate = new Date(now.getTime() + 4 * 60 * 60 * 1000); // later today
  const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days
  const futureDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

  console.log("Seeding rich tasks and collaboration...");

  // Task 1: Overdue Urgent
  const task1 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colInProgress.id,
      title: "Resolve Neon connection pooler timeouts under high concurrency",
      description: "Ensure PgBouncer configuration on port 6543 handles spike loads gracefully during batch operations.",
      priority: TaskPriority.URGENT,
      status: "IN_PROGRESS",
      creatorId: giorgi.id,
      assigneeId: giorgi.id,
      dueDate: pastDate,
      orderIndex: 1000,
      totalTimeSpent: 7200, // 2 hours
      labels: { create: [{ labelId: labelBackend.id }, { labelId: labelUrgent.id }] },
    },
  });

  // Task 2: Due Today
  const task2 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colInProgress.id,
      title: "Implement accessible keyboard navigation for Kanban column reordering",
      description: "Support dropdown menu alternatives and ARIA live announcements for assistive tech.",
      priority: TaskPriority.HIGH,
      status: "IN_PROGRESS",
      creatorId: giorgi.id,
      assigneeId: alex.id,
      dueDate: todayDate,
      orderIndex: 2000,
      totalTimeSpent: 3600,
      labels: { create: [{ labelId: labelFrontend.id }] },
    },
  });

  // Task 3: Todo High
  const task3 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colTodo.id,
      title: "Audit RBAC capability matrix against unauthorized IDOR requests",
      description: "Verify that passing arbitrary workspaceId or taskId throws HTTP 403 Forbidden on the server.",
      priority: TaskPriority.HIGH,
      status: "TODO",
      creatorId: alex.id,
      assigneeId: maria.id,
      dueDate: futureDate1,
      orderIndex: 1000,
      labels: { create: [{ labelId: labelBackend.id }] },
    },
  });

  // Task 4: In Review
  const task4 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colReview.id,
      title: "Build Command Palette (Cmd + K) fuzzy search integration",
      description: "Real-time fuzzy search across tasks, projects, boards, and labels with keyboard shortcuts.",
      priority: TaskPriority.MEDIUM,
      status: "REVIEW",
      creatorId: giorgi.id,
      assigneeId: maria.id,
      dueDate: futureDate2,
      orderIndex: 1000,
      totalTimeSpent: 5400,
      labels: { create: [{ labelId: labelFrontend.id }] },
    },
  });

  // Task 5: Done
  const task5 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colDone.id,
      title: "Initialize Next.js 16 project structure and Prisma ORM client",
      description: "Bootstrapped App Router, TypeScript strict configuration, and 28-model schema.",
      priority: TaskPriority.HIGH,
      status: "DONE",
      creatorId: giorgi.id,
      assigneeId: giorgi.id,
      completedAt: pastDate,
      orderIndex: 1000,
      totalTimeSpent: 9000,
      labels: { create: [{ labelId: labelBackend.id }, { labelId: labelDevOps.id }] },
    },
  });

  // Task 6: Backlog
  const task6 = await prisma.task.create({
    data: {
      projectId: projCoreApp.id,
      boardId: coreBoard.id,
      columnId: colBacklog.id,
      title: "Design transactional email templates for assignment and due-date alerts",
      description: "Editorial styling matching the warm paper aesthetic.",
      priority: TaskPriority.LOW,
      status: "BACKLOG",
      creatorId: giorgi.id,
      assigneeId: alex.id,
      orderIndex: 1000,
      labels: { create: [{ labelId: labelDesign.id }] },
    },
  });

  // Tasks in Design System Project
  const taskD1 = await prisma.task.create({
    data: {
      projectId: projDesignSystem.id,
      boardId: designBoard.id,
      columnId: dColActive.id,
      title: "Refine Soft Neo-Brutalist button press states and retro shadows",
      description: "Crisp 1.5px ink border with 2px offset shadow and active translation.",
      priority: TaskPriority.HIGH,
      status: "IN_DESIGN",
      creatorId: giorgi.id,
      assigneeId: giorgi.id,
      dueDate: todayDate,
      orderIndex: 1000,
      totalTimeSpent: 4200,
      labels: { create: [{ labelId: labelDesign.id }] },
    },
  });

  const taskD2 = await prisma.task.create({
    data: {
      projectId: projDesignSystem.id,
      boardId: designBoard.id,
      columnId: dColDone.id,
      title: "Establish warm cream paper palette tokens (#FDFBF7, #F5F2EB)",
      description: "Defined CSS variables and Tailwind v4 theme mapping.",
      priority: TaskPriority.MEDIUM,
      status: "APPROVED",
      creatorId: giorgi.id,
      assigneeId: maria.id,
      completedAt: pastDate,
      orderIndex: 1000,
      totalTimeSpent: 3000,
      labels: { create: [{ labelId: labelDesign.id }] },
    },
  });

  // 7. Subtasks for Task 1 & Task 2
  console.log("Seeding subtasks...");
  await prisma.subtask.createMany({
    data: [
      { taskId: task1.id, title: "Check connection timeout threshold in prisma client", completed: true, orderIndex: 1000 },
      { taskId: task1.id, title: "Enable keepalive pings for Neon serverless pooler", completed: true, orderIndex: 2000 },
      { taskId: task1.id, title: "Stress test with 50 concurrent transactions", completed: false, orderIndex: 3000 },
      { taskId: task2.id, title: "Map arrow keys to column sortable containers", completed: true, orderIndex: 1000 },
      { taskId: task2.id, title: "Add aria-describedby status readout", completed: false, orderIndex: 2000 },
    ],
  });

  // 8. Task Dependency: Task 1 blocks Task 3
  console.log("Seeding dependencies...");
  await prisma.taskDependency.create({
    data: {
      blockerId: task1.id,
      dependentId: task3.id,
    },
  });

  // 9. Comments
  console.log("Seeding comments...");
  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        authorId: alex.id,
        content: "I monitored the Neon pooler metrics — port 6543 handles idle disconnects cleanly now.",
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        taskId: task1.id,
        authorId: giorgi.id,
        content: "Great observation! I will run the concurrency benchmark script before merging.",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        taskId: task4.id,
        authorId: maria.id,
        content: "Cmd+K is responsive and searches tasks, projects, and boards in sub-10ms.",
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
    ],
  });

  // 10. Time Entries
  console.log("Seeding time tracking logs...");
  await prisma.timeEntry.createMany({
    data: [
      { taskId: task1.id, userId: giorgi.id, duration: 3600, description: "Investigating Neon latency" },
      { taskId: task1.id, userId: giorgi.id, duration: 3600, description: "Testing pooled connection strings" },
      { taskId: task2.id, userId: alex.id, duration: 3600, description: "Configuring dnd-kit keyboard coordinates" },
    ],
  });

  // 11. Activities (Audit Log)
  console.log("Seeding activity history...");
  await prisma.activity.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId: projCoreApp.id,
        taskId: task1.id,
        actorId: giorgi.id,
        action: ActivityAction.TASK_CREATED,
        metadata: { title: task1.title },
      },
      {
        workspaceId: workspace.id,
        projectId: projCoreApp.id,
        taskId: task1.id,
        actorId: giorgi.id,
        action: ActivityAction.TASK_MOVED,
        metadata: { toColumn: "In Progress" },
      },
      {
        workspaceId: workspace.id,
        projectId: projCoreApp.id,
        taskId: task5.id,
        actorId: giorgi.id,
        action: ActivityAction.TASK_STATUS_CHANGED,
        metadata: { status: "DONE" },
      },
    ],
  });

  // 12. In-App Notifications
  console.log("Seeding notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: giorgi.id,
        type: NotificationType.TASK_ASSIGNED,
        title: "Task Assigned",
        message: "You were assigned to 'Resolve Neon connection pooler timeouts'.",
        linkUrl: `/app/${workspace.slug}/projects/${projCoreApp.slug}/board?taskId=${task1.id}`,
        read: false,
      },
      {
        userId: giorgi.id,
        type: NotificationType.TASK_DUE_SOON,
        title: "Task Due Soon",
        message: "Task 'Implement accessible keyboard navigation' is due today.",
        linkUrl: `/app/${workspace.slug}/projects/${projCoreApp.slug}/board?taskId=${task2.id}`,
        read: false,
      },
      {
        userId: giorgi.id,
        type: NotificationType.TASK_COMMENT,
        title: "New Comment",
        message: "Alex Rivera commented on 'Resolve Neon connection pooler timeouts'.",
        linkUrl: `/app/${workspace.slug}/projects/${projCoreApp.slug}/board?taskId=${task1.id}`,
        read: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
