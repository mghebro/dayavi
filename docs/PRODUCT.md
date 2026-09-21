# Dayavi (დაყავი) — Product Specification

## 1. Vision & Identity

**Dayavi** (derived from the Georgian word **დაყავი**, meaning *"divide"*, *"break down"*, or *"partition"*) is a high-performance, portfolio-grade task and project management platform. 

The core philosophy of Dayavi is rooted in the timeless problem-solving principle: **divide and conquer**. Complex engineering and creative initiatives become actionable only when broken down into clear, structured, and prioritized elements.

Dayavi pairs this rigorous organizational capability with an expressive, **Playful Editorial & Soft Neo-Brutalist visual identity**. It rejects the sterile, uniform aesthetics of generic SaaS dashboards in favor of:
* Tactile, paper-like surfaces and warm cream hues (`#FDFBF7`, `#F5F2EB`).
* Crisp, structural ink borders and subtle retro offset shadows.
* Expressive editorial typography and strategic accent colors (warm coral, soft lavender, butter yellow, muted sage).
* The guiding UX principle: *"Playful outside, calm inside"* — expressive and creative on dashboards and high-level overviews, but laser-focused, dense, and distraction-free in execution views (Kanban, List, Calendar, and Task Detail).

---

## 2. Entity Hierarchy & Domain Model

Dayavi strictly enforces a 5-tier hierarchical architecture:

```text
Workspace (Team / Organization domain)
   │
   └── Projects (Distinct functional initiatives)
         │
         ├── Boards (Workflow containers)
         │     │
         │     ├── Columns (Workflow states e.g., Backlog, Todo, In Progress, Review, Done)
         │     │     │
         │     │     └── Tasks (Atomic units of work)
         │     │
         │     └── Project Settings, Analytics & Activity
         │
         └── Workload & Unified Views
```

### Hierarchy Breakdown:
1. **Workspace**: The tenant boundary. Contains members, permissions, labels, projects, and global workspace settings. Users can be members of multiple workspaces and switch seamlessly between them.
2. **Project**: A targeted initiative belonging to a workspace (e.g., *"Design System v2"*, *"Mobile App Launch"*, *"Core Engine Refactor"*). Projects feature statuses (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), members, boards, and analytics.
3. **Board**: A visual workflow within a project. Projects can host one or multiple boards for different functional pipelines.
4. **Column**: A defined stage in a board's workflow with configurable WIP (Work In Progress) limits, explicit ordering, and completion flags.
5. **Task**: The central work entity. Every task belongs to a Project, Board, and Column, with rich metadata (title, description, priority, dates, assignees, subtasks, dependencies, time logs, comments, and audit history).

---

## 3. Core Capabilities & Workflows

### 3.1 Task Lifecycle & Attributes
Every task in Dayavi supports:
* **Title & Markdown Description**: Clear, scannable title and rich text description.
* **Priority Levels**: `NONE`, `LOW`, `MEDIUM`, `HIGH`, `URGENT` — with immediate visual identification and filterability.
* **Assignees & Creator**: Explicit tracking of who created the task and who is accountable.
* **Dates**: `startDate` and `dueDate` for scheduling and milestone tracking.
* **Subtasks (Checklist)**: Lightweight actionable steps with completion ratios (e.g., `3/5 completed`) and optimistic toggling.
* **Dependencies**: Direct blocker/blocked relationships (`Task A blocks Task B`), backed by directed acyclic graph (DAG) cycle detection.
* **Time Tracking**: Real-time timer widget (start/stop) and manual duration logging with cumulative total calculations.
* **Recurrence**: Recurrence engine supporting `DAILY`, `WEEKLY`, `MONTHLY`, and `CUSTOM` rules, generating clean independent instances.
* **Comments Stream**: Collaborative discussion feed with author avatars, timestamps, and edit/delete permissions.
* **Immutable Activity History**: Complete audit trail capturing every state change, assignment, movement, and comment.

### 3.2 Five Unified Project Lenses (Views)
The same underlying data is presented through five specialized views:
1. **Kanban View**: Visual pipeline with accessible drag-and-drop (`@dnd-kit`), column reordering, WIP indicators, and rapid inline task creation.
2. **List View**: Power-user table view with multi-select checkboxes, sortable columns, inline editing, and bulk operations (batch status, priority, assignment, and deletion).
3. **Calendar View**: Time-oriented schedule view mapping tasks by start and due dates across monthly and weekly layouts.
4. **Dashboard View**: Real-time analytics and charts answering: *"Where are the bottlenecks? What is the team's velocity? How is the workload distributed?"*
5. **My Tasks (Personal Triage)**: Cross-project personal triage view categorized into `Today`, `Overdue`, `Upcoming`, and `Completed`.

### 3.3 Search & Productivity
* **Global Command Palette (`Cmd + K` / `Ctrl + K`)**: Instant keyboard-driven navigation across workspaces, projects, boards, and quick actions.
* **Fuzzy Search Dialog**: Real-time server-backed search spanning tasks, projects, boards, users, and labels.
* **Keyboard Shortcuts**: Productivity bindings (`C` for new task, `/` for search, `?` for shortcuts guide).
* **Optimistic UI with Undo**: Instant UI feedback on task moves, status changes, and completions, backed by a 5-second undo toast notification.
