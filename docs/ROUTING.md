# Dayavi (დაყავი) — Application Routing Architecture

## 1. App Router Directory & Route Map

Dayavi utilizes the Next.js 16 App Router. The routing tree is structured around clear public vs. authenticated boundaries and workspace tenant scoping:

```text
/
├── (marketing)
│   └── page.tsx                              # Public Editorial Landing Page
│
├── (auth)
│   ├── login/page.tsx                        # Credentials & Social Sign-In
│   ├── register/page.tsx                     # Account Registration
│   ├── forgot-password/page.tsx              # Password Reset Request
│   ├── reset-password/page.tsx               # Password Reset Submission
│   └── verify-email/page.tsx                 # Email Verification Confirmation
│
└── app/
    ├── layout.tsx                            # Root App Shell (SessionProvider, Theme, Toaster)
    ├── page.tsx                              # Workspace Resolver (Redirects to active workspace)
    │
    └── [workspaceSlug]/
        ├── layout.tsx                        # Workspace Layout (Sidebar, TopBar, CommandPalette)
        ├── dashboard/page.tsx                # Workspace-level Overview & Metrics
        ├── my-tasks/page.tsx                 # Cross-Project Personal Triage Screen
        ├── notifications/page.tsx            # In-App Notification Center
        ├── settings/page.tsx                 # Workspace Settings, Members, Danger Zone
        │
        └── projects/
            ├── page.tsx                      # Projects Directory & Creation Card
            │
            └── [projectSlug]/
                ├── layout.tsx                # Project Header & 5-Way View Switcher
                ├── board/page.tsx            # Kanban Board View
                ├── list/page.tsx             # Dense Multi-Select List View
                ├── calendar/page.tsx         # Monthly/Weekly Calendar View
                ├── analytics/page.tsx        # Project Velocity & Workload Analytics
                └── settings/page.tsx         # Project Settings & Archive Controls
```

---

## 2. Dynamic Segment & Slug Resolution

1. `[workspaceSlug]`: Resolves the tenant workspace. The layout validates that the authenticated user is an active member in `WorkspaceMember`. If the slug does not exist or access is forbidden, it triggers Next.js `notFound()`.
2. `[projectSlug]`: Scoped strictly within the active workspace. Looked up via `prisma.project.findUnique({ where: { workspaceId_slug: { workspaceId, slug: projectSlug } } })`.

---

## 3. URL State Synchronization (Deep Linking)

To ensure that views are shareable, refresh-safe, and support native browser history (Back / Forward buttons), important UI states are synchronized with URL search params:

| Query Parameter | Example Value | Description |
| :--- | :--- | :--- |
| `taskId` | `?taskId=tsk_98f12` | Opens the Task Detail slide-over drawer on top of any view (Board, List, Calendar). |
| `priority` | `?priority=HIGH,URGENT` | Filters displayed tasks by comma-separated priority enums. |
| `status` | `?status=IN_PROGRESS` | Filters tasks by column or workflow status. |
| `assignee` | `?assignee=usr_43a1` | Filters tasks assigned to specific team member(s). |
| `sort` | `?sort=dueDate&dir=asc`| Controls table sort column and ascending/descending order. |
| `search` | `?search=refactor` | Preserves local list search term. |

### Shallow Routing & URL Updates
URL query updates inside Client Components use `next/navigation`:
```typescript
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

function openTask(taskId: string) {
  const params = new URLSearchParams(searchParams);
  params.set("taskId", taskId);
  router.push(`${pathname}?${params.toString()}`, { scroll: false });
}
```
This enables seamless deep-linking: sharing a URL like `/app/core-team/projects/web-app/board?taskId=tsk_123` allows any authorized teammate to open directly to that task.
