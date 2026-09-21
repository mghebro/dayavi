# Dayavi (დაყავი) — Analytics & Metrics Architecture

## 1. Analytics Philosophy

In Dayavi, **all metrics are computed from real PostgreSQL data**. There are no fake KPI counters, random mock figures, or decorative charts that misrepresent actual progress.

Furthermore, Dayavi rejects bloated third-party charting libraries that add hundreds of kilobytes of JavaScript to the client bundle. Instead, analytics are computed server-side and visualized through **custom, lightweight, accessible SVG and Tailwind-based charts** with high visual personality.

---

## 2. Core Metrics & Mathematical Formulations

### 2.1 Workspace Overview Metrics
* **Total Tasks ($N_{\text{total}}$)**: Count of all non-archived tasks within the workspace.
* **Completed Tasks ($N_{\text{done}}$)**: Count of tasks residing in a completed column or marked `status = COMPLETED`.
* **Completion Rate**:
  $$\text{Completion Rate} = \begin{cases} 0\% & \text{if } N_{\text{total}} = 0 \\ \left( \frac{N_{\text{done}}}{N_{\text{total}}} \right) \times 100 & \text{otherwise} \end{cases}$$
* **Overdue Tasks ($N_{\text{overdue}}$)**: Tasks with `dueDate < NOW()` and `completedAt IS NULL`.
* **Urgent Tasks**: Active tasks marked with `priority = URGENT`.

### 2.2 Workflow & Bottleneck Distribution
* **Tasks by Status / Column**: Breakdown across workflow states (`Backlog`, `Todo`, `In Progress`, `Review`, `Done`), revealing stage accumulation.
* **Tasks by Priority**: Visual breakdown of `URGENT`, `HIGH`, `MEDIUM`, `LOW`, and `NONE`.
* **Member Workload Distribution**:
  - Tasks assigned per member.
  - Completed vs. Pending ratio per member.
  - Identifies overallocation before project delivery is compromised.
* **Time Tracking Aggregation**:
  - Total cumulative hours logged across all tasks from `TimeEntry` records.

---

## 3. Database Query Strategies & Performance

To prevent heavy sequential scans across large task tables, analytics queries leverage Prisma aggregations and composite indexes:

```typescript
// Fast parallel aggregation query
export async function getWorkspaceAnalytics(workspaceId: string) {
  const [totalCount, completedCount, overdueCount, priorityGroups, memberWorkload] =
    await Promise.all([
      prisma.task.count({ where: { project: { workspaceId } } }),
      prisma.task.count({ where: { project: { workspaceId }, completedAt: { not: null } } }),
      prisma.task.count({
        where: {
          project: { workspaceId },
          completedAt: null,
          dueDate: { lt: new Date() },
        },
      }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { project: { workspaceId } },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by: ["assigneeId"],
        where: { project: { workspaceId }, completedAt: null },
        _count: { id: true },
      }),
    ]);

  return {
    totalCount,
    completedCount,
    overdueCount,
    priorityGroups,
    memberWorkload,
  };
}
```

---

## 4. Visual Presentation (Editorial Soft Neo-Brutalism)

* **Progress Rings & Meters**: Thick, high-contrast borders (`border-stone-800`) with coral and mint fills.
* **Editorial Bar Chart**: Vertical and horizontal pill bars with tactile retro offset shadows and numeric callouts.
* **Donut Distribution**: Clean SVG ring segment charts displaying status breakdowns with labeled legends.
* **Accessibility**: Every visual chart includes an underlying semantic HTML `table` with `sr-only` class, ensuring complete accessibility for screen-reader users.
