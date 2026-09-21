# Dayavi (დაყავი) — Authorization & Permission Model

## 1. Authorization Philosophy

In Dayavi, **authorization is strictly enforced on the server**. Frontend checks (disabling buttons, hiding menu items) are considered cosmetic UX conveniences; the authoritative security boundary resides in Server Actions, Route Handlers, and domain services.

Every request carrying an entity ID (Workspace, Project, Board, Column, Task, Comment) is validated to ensure:
1. The authenticated user belongs to the associated tenant Workspace.
2. The user holds a role with sufficient capability to perform the requested operation.
3. Access rights are confirmed against direct database lookups rather than unverified client assertions (preventing Insecure Direct Object References / IDOR).

---

## 2. Role Hierarchy & Capability Matrix

Dayavi defines four discrete workspace roles:

| Capability | OWNER | ADMIN | MEMBER | VIEWER |
| :--- | :---: | :---: | :---: | :---: |
| **Workspace Management** | | | | |
| Delete Workspace | ✅ | ❌ | ❌ | ❌ |
| Update Workspace Settings / Name | ✅ | ✅ | ❌ | ❌ |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅ (Non-Owners) | ❌ | ❌ |
| Change Member Roles | ✅ | ✅ (To Member/Viewer) | ❌ | ❌ |
| **Project Operations** | | | | |
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Edit Project Settings & Archive | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ |
| **Task & Workflow Operations** | | | | |
| Create Boards & Columns | ✅ | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Edit Tasks & Change Status | ✅ | ✅ | ✅ | ❌ |
| Move Tasks (Kanban Drag & Drop)| ✅ | ✅ | ✅ | ❌ |
| Add Comments & Subtasks | ✅ | ✅ | ✅ | ❌ |
| Log Time Entries | ✅ | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ (Author Only) | ❌ |
| **Read & Exploration** | | | | |
| View Boards, Lists, Calendars | ✅ | ✅ | ✅ | ✅ |
| Global Search & Filter | ✅ | ✅ | ✅ | ✅ |
| View Analytics & Reports | ✅ | ✅ | ✅ | ✅ |

---

## 3. Centralized Permission Helpers (`src/lib/permissions.ts`)

Instead of spreading ad-hoc role checks across UI components or actions, Dayavi provides a centralized permission library:

```typescript
// Permission Capability Definitions
export type Permission =
  | "MANAGE_WORKSPACE"
  | "INVITE_MEMBER"
  | "CREATE_PROJECT"
  | "MANAGE_PROJECT"
  | "MANAGE_BOARDS"
  | "CREATE_TASK"
  | "EDIT_TASK"
  | "DELETE_TASK"
  | "COMMENT"
  | "VIEW";

// Role-to-Permission Mapping
const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  OWNER: new Set([
    "MANAGE_WORKSPACE", "INVITE_MEMBER", "CREATE_PROJECT",
    "MANAGE_PROJECT", "MANAGE_BOARDS", "CREATE_TASK",
    "EDIT_TASK", "DELETE_TASK", "COMMENT", "VIEW"
  ]),
  ADMIN: new Set([
    "INVITE_MEMBER", "CREATE_PROJECT", "MANAGE_PROJECT",
    "MANAGE_BOARDS", "CREATE_TASK", "EDIT_TASK",
    "DELETE_TASK", "COMMENT", "VIEW"
  ]),
  MEMBER: new Set([
    "CREATE_TASK", "EDIT_TASK", "COMMENT", "VIEW"
  ]),
  VIEWER: new Set([
    "VIEW"
  ]),
};

export async function assertWorkspacePermission(
  workspaceId: string,
  userId: string,
  permission: Permission
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member) {
    throw new ForbiddenError("You are not a member of this workspace.");
  }

  const permissions = ROLE_PERMISSIONS[member.role];
  if (!permissions || !permissions.has(permission)) {
    throw new ForbiddenError(`Permission denied: ${permission} required.`);
  }

  return member;
}
```

---

## 4. Entity Access Resolvers

To prevent IDOR vulnerabilities when acting on child entities (such as tasks), the system resolves the task's parent workspace and verifies authorization in a single, index-backed query:

```typescript
export async function assertTaskPermission(
  taskId: string,
  userId: string,
  permission: Permission
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      creatorId: true,
      project: { select: { workspaceId: true } },
    },
  });

  if (!task) throw new NotFoundError("Task not found");

  const member = await assertWorkspacePermission(
    task.project.workspaceId,
    userId,
    permission
  );

  // Author-specific override for task deletion
  if (permission === "DELETE_TASK" && member.role === "MEMBER") {
    if (task.creatorId !== userId) {
      throw new ForbiddenError("Members may only delete tasks they created.");
    }
  }

  return { task, member };
}
```
