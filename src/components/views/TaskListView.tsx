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
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"title" | "priority" | "dueDate">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredTasks = tasks.filter((tItem) => {
    if (priorityFilter !== "ALL" && tItem.priority !== priorityFilter) return false;
    if (statusFilter !== "ALL" && tItem.column.id !== statusFilter) return false;
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
      setSelectedIds(sortedTasks.map((tItem) => tItem.id));
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
    toast.success(`${t.views.list.bulkPriority}: ${selectedIds.length}`);
    setSelectedIds([]);
    router.refresh();
  };

  const handleBulkDelete = async () => {
    if (confirm(t.tasks.deleteTaskConfirm)) {
      await bulkUpdateTasksAction({
        taskIds: selectedIds,
        action: "DELETE",
      });
      toast.success(t.tasks.taskDeletedSuccess);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
            <Filter className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>{t.common.filter}:</span>
          </div>

          {/* Priority filter */}
          <select
            className="text-xs font-bold rounded-lg border border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#15151A] text-[#18181B] dark:text-[#F4F4F5] px-2.5 py-1"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">{t.common.all} ({t.common.priority})</option>
            <option value="URGENT">{t.priorities.URGENT}</option>
            <option value="HIGH">{t.priorities.HIGH}</option>
            <option value="MEDIUM">{t.priorities.MEDIUM}</option>
            <option value="LOW">{t.priorities.LOW}</option>
            <option value="NONE">{t.priorities.NONE}</option>
          </select>

          {/* Column/Status filter */}
          <select
            className="text-xs font-bold rounded-lg border border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#15151A] text-[#18181B] dark:text-[#F4F4F5] px-2.5 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{t.common.all} ({t.common.status})</option>
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
              {t.common.undo}
            </Button>
          )}
        </div>

        <div className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">
          {sortedTasks.length} / {tasks.length}
        </div>
      </div>

      {/* Dense Table Container */}
      <div className="rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#15151A] text-[11px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
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
                  className="p-3 cursor-pointer hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  onClick={() => {
                    setSortField("title");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.common.title}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">{t.common.status}</th>
                <th
                  className="p-3 cursor-pointer hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  onClick={() => {
                    setSortField("priority");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.common.priority}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">{t.common.assignee}</th>
                <th
                  className="p-3 cursor-pointer hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  onClick={() => {
                    setSortField("dueDate");
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.common.dueDate}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">{t.tasks.subtasks}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E38] text-xs">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-xs text-[#71717A] dark:text-[#A1A1AA] font-bold"
                  >
                    {t.views.list.noTasks}
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
                      className={`hover:bg-[#FDFBF7] dark:hover:bg-[#202029] cursor-pointer transition-colors ${
                        isSelected ? "bg-[#FEF08A]/20 dark:bg-[#3D3512]/40" : ""
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

                      <td className="p-3 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        <span className="hover:text-[#FF6B4A] transition-colors">
                          {task.title}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-[#52525B] dark:text-[#A1A1AA]">
                        <span className="px-2 py-0.5 rounded bg-[#F5F2EB] dark:bg-[#202029] border border-[#18181B]/40 dark:border-[#3F3F4A] text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5]">
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
                            {t.priorities[task.priority] || task.priority}
                          </Badge>
                        )}
                      </td>

                      <td className="p-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#18181B] dark:text-[#F4F4F5]">
                            <Avatar className="h-5 w-5 border border-[#18181B] dark:border-[#3F3F4A]">
                              {task.assignee.image && (
                                <AvatarImage src={task.assignee.image} />
                              )}
                              <AvatarFallback className="text-[9px] bg-[#FF6B4A] text-white">
                                {task.assignee.name?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[100px]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A1A1AA] italic text-[11px]">
                            {t.common.unassigned}
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-semibold">
                        {task.dueDate ? (
                          <span
                            className={`flex items-center gap-1 text-[11px] ${
                              isOverdue ? "text-[#DC2626] dark:text-[#EF4444] font-bold" : "text-[#71717A] dark:text-[#A1A1AA]"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </span>
                        ) : (
                          <span className="text-[#A1A1AA]">—</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#18181B] dark:bg-[#1E1E26] text-white p-3.5 px-6 rounded-2xl border-2 border-white dark:border-[#FF6B4A] shadow-retro-lg flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-black text-[#FEF08A] dark:text-[#FACC15]">
            {selectedIds.length} {t.views.list.selectedCount}
          </span>

          <div className="h-4 w-px bg-white/30 dark:bg-white/20" />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPriority("HIGH")}
              className="text-xs font-bold"
            >
              {t.views.list.bulkPriority}: {t.priorities.HIGH}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkPriority("URGENT")}
              className="text-xs font-bold text-[#FF6B4A]"
            >
              {t.views.list.bulkPriority}: {t.priorities.URGENT}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              className="text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {t.common.delete}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            className="text-xs text-[#A1A1AA] hover:text-white"
          >
            {t.common.cancel}
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
