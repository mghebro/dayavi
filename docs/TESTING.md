# Dayavi (დაყავი) — Testing Strategy & Verification Plan

## 1. Testing Philosophy

A production-quality task management platform cannot rely on casual manual checks. Dayavi employs a **three-tier testing pyramid**:

```text
       ▲
      / \     E2E Tests (Critical User Journeys via Playwright)
     /───\
    /     \   Integration Tests (Server Actions, RBAC Guards, DB Transactions)
   /───────\
  /         \ Unit Tests (Zod Schemas, Float Ordering, DAG Cycle Prevention, Math)
 ─────────────
```

---

## 2. Unit Testing Suite

Unit tests run in seconds using **Vitest**:

### 2.1 Validation Schemas (`src/lib/validation/`)
* Verify email, slug, and password rules (minimum length, character classes).
* Verify task creation constraints (required title, valid priority enum, sanitized description).
* Verify date boundaries (`dueDate` must not precede `startDate` when both are supplied).

### 2.2 Business Logic & Algorithms
* **Fractional Float Ordering (`src/lib/ordering.ts`)**:
  - Test insertion between two values: `calculateNewOrder(1000, 2000) === 1500`.
  - Test insertion at the top of column: `calculateNewOrder(null, 1000) === 500`.
  - Test insertion at the bottom: `calculateNewOrder(3000, null) === 4000`.
  - Test rebalance detection when gap $< 10^{-6}$.
* **Dependency Cycle Detection (DAG) (`src/lib/dependencies.ts`)**:
  - Prevent self-dependency (`Task A` depends on `Task A`).
  - Prevent direct 2-node cycle (`Task A -> Task B -> Task A`).
  - Prevent deep multi-node cycle (`A -> B -> C -> D -> A`).
* **RBAC Capability Matrix (`src/lib/permissions.ts`)**:
  - Verify `OWNER` has all capabilities.
  - Verify `VIEWER` is strictly rejected for `CREATE_TASK`, `EDIT_TASK`, `DELETE_TASK`.
  - Verify `MEMBER` can delete only their own tasks.

---

## 3. Integration Testing Suite

Tests the interplay between Next.js Server Actions, authorization guards, and database transactions:
* **Workspace Isolation**: Attempting to query or mutate a Project/Task using an account not in `WorkspaceMember` must throw a `ForbiddenError` (HTTP 403).
* **Task Movement Transaction**: Verifies that moving a task updates `columnId`, `orderIndex`, and writes an `Activity` audit row atomically.
* **Bulk Operations**: Verifies that batch-updating 10 tasks respects individual permissions and completes in a single transaction.

---

## 4. End-to-End (E2E) User Journeys

Automated E2E tests via **Playwright** validate the full stack in a headless browser:

1. **Authentication Flow**:
   - Register a new account (`testuser@example.com`).
   - Confirm session cookies and redirect to `/app`.
   - Log out and confirm redirection to `/login`.
2. **Project & Kanban Flow**:
   - Create a new project *"Alpha Launch"*.
   - Create three tasks in the *Todo* column.
   - Drag a task to the *In Progress* column.
   - Verify optimistic UI transition and persistent state after page reload.
3. **Task Detail Drawer**:
   - Click a task card to open the drawer.
   - Edit the task title and add two checklist subtasks.
   - Complete one subtask and verify progress indicator updates to `1/2`.
   - Start the live timer, wait 3 seconds, stop timer, and verify time logged.
4. **Command Palette (`Cmd + K`)**:
   - Trigger `Cmd + K`, search for task by name, hit `Enter`, and confirm task drawer opens.

---

## 5. Verification Commands

```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Execute Playwright E2E tests
npm run test:e2e

# Full typechecking and linting
npm run typecheck
npm run lint
```
