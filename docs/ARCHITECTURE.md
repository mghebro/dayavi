# Dayavi (დაყავი) — System Architecture

## 1. Architectural Philosophy & Constraints

Dayavi is designed as a **modern, monolithic full-stack Next.js 16 application**. Per the system requirements:
* **No external backend service**: There is no secondary Node/Express, NestJS, or Go service. All server-side computation, API handling, authorization guards, and database transactions execute natively within Next.js.
* **Server-First by Default**: React Server Components (RSC) are utilized for all initial data loading, layout composition, and static or streaming content. Client Components are introduced strictly where browser state, interactivity, keyboard event handling, or drag-and-drop mechanics are required.
* **Separation of Concerns**: UI components never query the database directly or execute unchecked business logic. Every mutation travels through a strict, typed multi-layer pipeline:

$$\text{User Interaction} \longrightarrow \text{Server Action} \longrightarrow \text{Zod Validation} \longrightarrow \text{RBAC Authorization Guard} \longrightarrow \text{Domain Service} \longrightarrow \text{Prisma ORM} \longrightarrow \text{Neon PostgreSQL}$$

---

## 2. Next.js 16 App Router Structure

```text
src/
├── app/
│   ├── (auth)/                       # Public Authentication route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (marketing)/                  # Editorial Public Landing Page
│   │   └── page.tsx
│   │
│   ├── app/                          # Authenticated Application Shell
│   │   ├── layout.tsx                # Global Shell Layout (Sidebar, TopBar, Providers)
│   │   ├── page.tsx                  # Workspace redirector
│   │   │
│   │   └── [workspaceSlug]/          # Workspace Tenant Segment
│   │       ├── layout.tsx            # Workspace Context Provider & Navigation
│   │       ├── dashboard/page.tsx    # High-level Workspace Dashboard & Analytics
│   │       ├── my-tasks/page.tsx     # Personal Triage Screen
│   │       ├── notifications/page.tsx# Notification Center
│   │       ├── settings/page.tsx     # Workspace Members & Configuration
│   │       │
│   │       └── projects/
│   │           ├── page.tsx          # Project Grid & Directory
│   │           └── [projectSlug]/    # Project Segment
│   │               ├── layout.tsx    # Project Header & Unified 5-Way View Switcher
│   │               ├── board/page.tsx      # Kanban Board View
│   │               ├── list/page.tsx       # Dense Power-User List View
│   │               ├── calendar/page.tsx   # Calendar Schedule View
│   │               ├── analytics/page.tsx  # Project Analytics View
│   │               └── settings/page.tsx   # Project Settings View
│   │
│   ├── api/                          # Route Handlers
│   │   ├── auth/[...nextauth]/       # Auth.js Route Handler
│   │   └── cron/                     # Recurrence & Reminder background triggers
│   │
│   └── globals.css                   # Tailwind v4/tokens & soft-brutalist custom utilities
```

---

## 3. Server vs. Client Boundary Strategy

| Layer / Component | Type | Justification |
| :--- | :--- | :--- |
| `layout.tsx` (App Shell) | Server Component | Fetches user session, workspace list, unread notification counts, and passes them to lightweight client islands. |
| `BoardPage` / `KanbanBoard` | Client Component | Uses `@dnd-kit` sensors, collision detection algorithms, active drag overlays, and local optimistic updates. |
| `TaskList` / `DataTable` | Client Component | Manages multi-row checkbox selections, sorting states, filter dropdowns, and batch operations. |
| `TaskDetailDrawer` | Client Component | Handles live timer interval tickers, markdown editor, inline form inputs, and tab switching; deep-linked to URL query `?taskId=`. |
| `DashboardOverview` | Server Component | Aggregates database queries across tasks and members; renders fast SVG-based charts with minimal client bundle overhead. |
| `CommandPalette` | Client Component | Listens for global `Cmd+K` / `Ctrl+K` keydowns, handles fuzzy search indexing, and manages modal focus trapping. |

---

## 4. Mutation & State Management Pipeline

Mutations are executed exclusively via **Next.js Server Actions** with built-in type safety:

```typescript
// Architectural Flow Example
export async function updateTaskColumnAction(input: UpdateTaskColumnInput) {
  // 1. Session Authentication
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  // 2. Input Validation (Zod)
  const validated = updateTaskColumnSchema.parse(input);

  // 3. Centralized Authorization Check
  await assertTaskPermission(validated.taskId, session.user.id, "EDIT_TASK");

  // 4. Domain Service Execution (with Prisma transaction)
  const result = await taskService.moveColumn({
    taskId: validated.taskId,
    targetColumnId: validated.targetColumnId,
    newOrderIndex: validated.newOrderIndex,
    actorId: session.user.id,
  });

  // 5. Cache Revalidation
  revalidatePath(`/app/${result.workspaceSlug}/projects/${result.projectSlug}/board`);

  return { success: true, data: result };
}
```

---

## 5. Resilience, Error Boundaries & Loading Strategy

1. **Granular `loading.tsx` Skeletons**: Every primary route (`dashboard`, `projects`, `board`, `my-tasks`) provides custom soft-brutalist skeletons matching the exact dimensions of cards, columns, and metric blocks.
2. **Error Boundaries (`error.tsx`)**: Unhandled exceptions render an editorial error state with recovery buttons (`Try again`, `Back to Dashboard`) rather than white-screening.
3. **Optimistic UI with Rollback**: Client components maintain optimistic state caches. If a server action throws or fails, state reverts immediately and an accessible error toast explains the failure.
