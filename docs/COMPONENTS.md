# Dayavi (დაყავი) — Component Architecture & Design System Catalog

## 1. Design Tokens & UI Primitives (`src/components/ui/`)

All base UI primitives are built upon accessible Radix UI primitives and styled with Dayavi's custom **Soft Neo-Brutalist** system:

| Component | Visual Styling & Characteristics |
| :--- | :--- |
| `Button` | Variants: `primary` (coral orange, retro shadow), `secondary` (sand cream, ink border), `outline` (crisp 1.5px border), `ghost` (minimal hover). Press effect: `active:translate-x-[1px] active:translate-y-[1px]`. |
| `Input` / `Textarea` | Warm white background, 1.5px ink border, subtle focus ring, rounded-lg. |
| `Badge` | High-contrast chips for priorities (`Urgent` = coral, `High` = butter yellow, `Medium` = lavender, `Low` = sage) and statuses. |
| `Dialog` / `Modal` | Centered modal with `rounded-2xl`, heavy ink border, hard offset shadow (`shadow-[4px_4px_0px_0px_#18181b]`). |
| `Drawer` / `Sheet` | Contextual slide-over drawer from the right edge with smooth spring transition and backdrop blur. |
| `DropdownMenu` | Accessible popover menu with keyboard navigation and retro shadow. |
| `Avatar` | Circular or squircle user avatar with fallback initials and border stroke. |

---

## 2. Shell & Navigation Components

### 2.1 `WorkspaceShell`
* **Sidebar**: Fixed on desktop, collapsible on mobile. Contains workspace switcher, navigation items (Dashboard, My Tasks, Projects, Notifications), project shortcuts, and bottom profile menu.
* **TopBar**: Context breadcrumbs, quick global search trigger (`Cmd + K`), "+ New Task" primary button, notification badge counter, and user profile trigger.
* **WorkspaceSwitcher**: Distinctive dropdown showing all user workspaces, current workspace badge, and a "Create Workspace" modal trigger.

---

## 3. Feature Components (`src/features/`)

### 3.1 Kanban Board (`src/features/boards/`)
* `KanbanBoard`: Parent container managing `@dnd-kit` drag context, active drag overlay, sensor configuration, and optimistic item movement.
* `KanbanColumn`: Droppable container displaying column name, task counter badge, WIP limit warning, "+ Add Task" button, and sortable task list.
* `TaskCard`: Draggable card displaying title, priority badge, project pill, assignee avatar, due date flag, and subtask progress indicator (`3/5`). Includes an accessible `...` menu for non-pointer moves.

### 3.2 List & Bulk Selection (`src/features/tasks/`)
* `TaskList`: High-density sortable table displaying tasks with column headers for status, priority, assignee, due date, and labels.
* `TaskRow`: Individual row supporting click-to-open drawer, inline title editing, and checkbox selection.
* `BulkActionBar`: Fixed floating bottom bar appearing when $\ge 1$ tasks are selected; provides batch operations (change status, change priority, assign teammate, delete tasks).

### 3.3 Task Detail Drawer (`src/features/tasks/TaskDetailDrawer.tsx`)
* Deep-linked contextual drawer opening over the current view.
* **Header**: Direct inline-editable title, status selector, priority dropdown, close button.
* **Properties Sidebar**: Assignee picker, Start / Due date pickers, Label tags combobox.
* **Description**: Rich markdown description editor with live preview toggle.
* **Subtasks Section**: Checklist with toggleable checkmarks, inline subtask adder, and visual progress bar.
* **Time Tracking Widget**: Real-time timer with start/stop toggle, duration ticker, and manual log entry dialog.
* **Dependencies Section**: Graph display of "Blocked by" and "Blocks" tasks with cycle-prevention validations.
* **Comments Feed**: Chronological discussion cards with author avatars, timestamps, and edit/delete actions.
* **Activity Timeline**: Immutable chronological log of all historical actions performed on the task.

### 3.4 Productivity & Utilities
* `CommandPalette`: Modal dialog listening for `Cmd + K` / `Ctrl + K` with grouped actions.
* `GlobalSearch`: Instant fuzzy search spanning tasks, projects, boards, labels, and users.
* `KeyboardShortcutsModal`: Shortcut guide triggered by pressing `?`.
* `UndoToast`: Retro-styled notification with an action button allowing users to undo accidental moves or deletions.
