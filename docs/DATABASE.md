# Dayavi (დაყავი) — Database Architecture & Schema Specification

## 1. Database Infrastructure (PostgreSQL on Neon)

Dayavi uses **PostgreSQL hosted on Neon** managed via **Prisma ORM**.
To support serverless execution in Next.js without exhausting database connection pools:
* `DATABASE_URL`: Configured with Neon's connection pooling pooler (port `6543`, `pgbouncer=true`).
* `DIRECT_URL`: Configured with direct database access (port `5432`) used by Prisma CLI during migrations.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 2. Full Relational Schema Design

### 2.1 Authentication & User Domain
* **User**: Core identity. Stores profile details, email, image, and optional `hashedPassword` for credentials authentication.
* **Account**: Auth.js OAuth account link (Google, GitHub) storing provider tokens.
* **Session**: Auth.js database sessions.
* **VerificationToken**: Secure single-use tokens for email verification.
* **PasswordResetToken**: Single-use expiration-bound tokens for password reset workflows.

### 2.2 Organization & Tenancy Domain
* **Workspace**: The primary tenant container. Has `name`, `slug` (globally unique index), `description`, `accentColor`, and `ownerId`.
* **WorkspaceMember**: Connects `User` and `Workspace` with `role`:
  - `OWNER`: Full administrative privileges, billing, member deletion, workspace deletion.
  - `ADMIN`: Project management, member invitation, workspace configuration.
  - `MEMBER`: Project collaboration, task creation, editing, commenting.
  - `VIEWER`: Read-only access to permitted resources.
* **Project**: Work initiative inside a workspace. Has `name`, `slug` (unique per workspace: `@@unique([workspaceId, slug])`), `status` (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), `accentColor`, and foreign key to `Workspace`.
* **ProjectMember**: Optional project-level assignment and explicit access overrides.

### 2.3 Workflow & Task Domain
* **Board**: Belongs to a `Project`. Organizes columns. Has `orderIndex: Float`.
* **Column**: Belongs to a `Board`. Represents workflow state (e.g., *Backlog*, *In Progress*, *Done*). Features `orderIndex: Float`, `wipLimit: Int?`, and `isCompletedColumn: Boolean`.
* **Task**: Core work entity.
  - Foreign keys: `projectId`, `boardId`, `columnId`, `creatorId`, `assigneeId?`.
  - Content: `title`, `description` (Markdown), `status`, `priority` (`NONE`, `LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Positional: `orderIndex: Float` for drag-and-drop column positioning.
  - Scheduling: `startDate: DateTime?`, `dueDate: DateTime?`, `completedAt: DateTime?`.
  - Recurrence: Relation to `Recurrence` entity.
  - Cumulative metrics: `totalTimeSpent: Int` (cached seconds).
* **Subtask**: Checklist item belonging to a `Task`. Has `title`, `completed: Boolean`, `orderIndex: Float`.
* **Label**: Workspace-scoped tag with `name` and `color`.
* **TaskLabel**: Many-to-many join table between `Task` and `Label`.

### 2.4 Collaboration & Tracking Domain
* **Comment**: Message attached to a `Task` with `authorId`, `content`, `createdAt`, and `updatedAt`.
* **TaskDependency**: Blocker/dependent relationship between tasks (`blockerId` -> `dependentId`). Validated against circular references prior to insertion.
* **TimeEntry**: Discrete work session with `taskId`, `userId`, `startTime`, `endTime?`, `duration` (in seconds), and optional `description`.
* **Recurrence**: Recurrence rule configuration (`frequency`: `DAILY`, `WEEKLY`, `MONTHLY`, `CUSTOM`, `interval`, `daysOfWeek`, `nextRunAt`).
* **Activity**: Immutable event log tracking who did what (`actorId`, `workspaceId`, `projectId`, `taskId?`, `action`, `metadata: Json`).
* **Notification**: In-app alert for assignments, mentions, comments, and due dates.
* **NotificationPreference**: User settings controlling delivery channels (in-app, email).

---

## 3. High-Performance Ordering Strategy (Fractional Floating-Point Indexing)

Rather than maintaining fragile sequential integer arrays (which require updating $N$ database rows whenever a task is moved to the top of a 200-task column), Dayavi utilizes **Fractional Float Ordering**:
* New tasks or columns are assigned an initial `orderIndex` spaced by intervals of $1000.0$ ($1000, 2000, 3000$).
* When an item is moved between item $A$ (order $1000$) and item $B$ (order $2000$), its new `orderIndex` is calculated as:
  $$\text{newOrder} = \frac{\text{order}_A + \text{order}_B}{2} = 1500.0$$
* Moving an item to the top:
  $$\text{newOrder} = \frac{\text{order}_{\text{first}}}{2}$$
* Moving an item to the bottom:
  $$\text{newOrder} = \text{order}_{\text{last}} + 1000.0$$
* **Rebalancing**: If the difference between adjacent items shrinks below $10^{-6}$, a lightweight background rebalancing transaction re-spaces the column to clean $1000$ intervals. This gives $O(1)$ database writes for 99.99% of drag-and-drop actions.

---

## 4. Indexing & Query Optimization Strategy

```text
INDEX EXAMPLES IN PRISMA:
- Task: @@index([columnId, orderIndex])        # Fast column task list rendering
- Task: @@index([projectId, status])           # Project view filtering
- Task: @@index([assigneeId, dueDate])         # "My Tasks" query
- WorkspaceMember: @@unique([workspaceId, userId]) # Membership lookups & auth guards
- Project: @@unique([workspaceId, slug])       # Clean tenant routing
- Activity: @@index([taskId, createdAt])       # Fast task timeline rendering
- Notification: @@index([userId, read])        # Unread badge queries
```

---

## 5. Transaction Safety & Cascade Rules

* **Atomic Moves**: Moving a task across columns executes within a Prisma `$transaction` that simultaneously updates the task's `columnId`, `orderIndex`, and appends an immutable `Activity` record.
* **Cascade Deletions**:
  - Deleting a `Workspace` cascades to `WorkspaceMember`, `Project`, and `Label`.
  - Deleting a `Project` cascades to `Board`, `Column`, and `Task`.
  - Deleting a `Task` cascades to `Subtask`, `Comment`, `TaskLabel`, and `TimeEntry`.
* **Orphan Protection**: Deleting a `User` sets `assigneeId = null` on active tasks rather than deleting collaborative work.
