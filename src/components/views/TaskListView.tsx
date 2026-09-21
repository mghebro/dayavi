"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { bulkUpdateTasksAction } from "@/server/actions/task";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Calendar,
  CheckSquare,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";

export interface ListTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: string;
  dueDate?: Date | string | null;
  startDate?: Date | string | null;
  totalTimeSpent: number;
  column: { id: string; name: string };
  assignee?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count: {
    subtasks: number;
    comments: number;
  };
  subtasks: Array<{ completed: boolean }>;
}

interface TaskListViewProps {
  tasks: ListTask[];
  columns: Array<{ id: string; name: string }>;
  currentUserId: string;
  activeTaskDetail?: TaskDetailData | null;
}

export function TaskListView({
  tasks,
  columns,
  currentUserId,
  activeTaskDetail,
}: TaskListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"title" | "priority" | "dueDate">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "ALL" && t.column.id !== statusFilter) return false;
    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === "title") {
      return sortDir === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortField === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (sortField === "priority") {
      const rank: Record<TaskPriority, number> = {
        URGENT: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
        NONE: 0,
      };
      return sortDir === "asc"
        ? rank[a.priority] - rank[b.priority]
        : rank[b.priority] - rank[a.priority];
    }
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(sortedTasks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkPriority = async (newPriority: TaskPriority) => {
    if (selectedIds.length === 0) return;
    await bulkUpdateTasksAction({
      taskIds: selectedIds,
      action: "SET_PRIORITY",
      value: newPriority,
    });
    toast.success(`Updated priority for ${selectedIds.length} tasks`);
    setSelectedIds([]);
    router.refresh();
  };

  const handleBulkDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} selected tasks?`
      )
    ) {
      await bulkUpdateTasksAction({
        taskIds: selectedIds,
        action: "DELETE",
      });
      toast.success(`Deleted ${selectedIds.length} tasks`);
      setSelectedIds([]);
      router.refresh();
    }
  };

  const handleOpenDetail = (taskId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("taskId", taskId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("taskId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      {/* Filters & Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B]">
            <Filter className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Filters:</span>
          </div>

          {/* Priority filter */}
          <select
            className="text-xs font-bold rounded-lg border border-[#18181B] bg-[#F5F2EB] px-2.5 py-1"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="NONE">No Priority</option>
          </select>

          {/* Column/Status filter */}
          <select
            className="text-xs font-bold rounded-lg border border-[#18181B] bg-[#F5F2EB] px-2.5 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Columns</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {(priorityFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPriorityFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs h-7 text-[#FF6B4A]"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="text-xs font-bold text-[#71717A]">
          Showing {sortedTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Dense Table Container */}
      <div className="rounded-2xl border-2 border-[#18181B] bg-white shadow-retro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#18181B] bg-[#FDFBF7] text-[11px] font-black text-[#71717A] uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <Checkbox
                    checked={
                      sortedTasks.length > 0 &&
                      selectedIds.length === sortedTasks.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th
                  className="p-3 cursor-pointer hover:text-[#18181B]"
                  onClick={() => {
                    setSortField("title");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Task Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Column / State</th>
                <th
                  className="p-3 cursor-pointer hover:text-[#18181B]"
                  onClick={() => {
                    setSortField("priority");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Assignee</th>
                <th
                  className="p-3 cursor-pointer hover:text-[#18181B]"
                  onClick={() => {
                    setSortField("dueDate");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Subtasks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E4E7] text-xs">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-xs text-[#71717A] font-bold"
                  >
                    No tasks found matching current filters.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const isSelected = selectedIds.includes(task.id);
                  const completedSubs =
                    task.subtasks.filter((s) => s.completed).length;
                  const totalSubs = task._count.subtasks;

                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "DONE";

                  return (
                    <tr
                      key={task.id}
                      onClick={() => handleOpenDetail(task.id)}
                      className={`hover:bg-[#FDFBF7] cursor-pointer transition-colors ${
                        isSelected ? "bg-[#FEF08A]/20" : ""
                      }`}
                    >
                      <td
                        className="p-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(task.id)}
                        />
                      </td>

                      <td className="p-3 font-bold text-[#18181B]">
                        <span className="hover:text-[#FF6B4A] transition-colors">
                          {task.title}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-[#52525B]">
                        <span className="px-2 py-0.5 rounded bg-[#F5F2EB] border border-[#18181B]/40 text-[11px] font-bold">
                          {task.column.name}
                        </span>
                      </td>

                      <td className="p-3">
                        {task.priority !== "NONE" && (
                          <Badge
                            variant={
                              task.priority === "URGENT"
                                ? "urgent"
                                : task.priority === "HIGH"
                                ? "high"
                                : task.priority === "MEDIUM"
                                ? "medium"
                                : "low"
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </td>

                      <td className="p-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#18181B]">
                            <Avatar className="h-5 w-5">
                              {task.assignee.image && (
                                <AvatarImage src={task.assignee.image} />
                              )}
                              <AvatarFallback className="text-[9px]">
                                {task.assignee.name?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[100px]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A1A1AA] italic text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-semibold">
                        {task.dueDate ? (
                          <span
                            className={`flex items-center gap-1 text-[11px] ${
                              isOverdue ? "text-[#DC2626] font-bold" : "text-[#71717A]"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </span>
                        ) : (
                          <span className="text-[#A1A1AA]">—</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-[11px] text-[#71717A]">
                        {totalSubs > 0 ? (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            <span>
                              {completedSubs}/{totalSubs}
                            </span>
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#18181B] text-white p-3.5 px-6 rounded-2xl border-2 border-white shadow-retro-lg flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-black text-[#FEF08A]">
            {selectedIds.length} tasks selected
          </span>

          <div className="h-4 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPriority("HIGH")}
              className="text-xs font-bold"
            >
              Mark High Priority
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPriority("URGENT")}
              className="text-xs font-bold text-[#FF6B4A]"
            >
              Mark Urgent
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              className="text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            className="text-xs text-[#A1A1AA] hover:text-white"
          >
            Deselect
          </Button>
        </div>
      )}

      {/* Task Detail Slide-Over Drawer */}
      <TaskDetailDrawer
        task={activeTaskDetail || null}
        isOpen={!!searchParams.get("taskId") && !!activeTaskDetail}
        onClose={handleCloseDetail}
        currentUserId={currentUserId}
      />
    </div>
  );
}
