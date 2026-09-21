"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { updateTaskAction } from "@/server/actions/task";
import { toast } from "sonner";
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { TaskPriority } from "@prisma/client";

interface MyTaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: string;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  project: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
  };
  column: {
    id: string;
    name: string;
    isCompletedColumn: boolean;
  };
}

interface MyTasksClientViewProps {
  overdue: MyTaskItem[];
  today: MyTaskItem[];
  upcoming: MyTaskItem[];
  completed: MyTaskItem[];
  workspaceSlug: string;
  currentUserId: string;
  activeTaskDetail?: TaskDetailData | null;
}

export function MyTasksClientView({
  overdue,
  today,
  upcoming,
  completed,
  workspaceSlug,
  currentUserId,
  activeTaskDetail,
}: MyTasksClientViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const handleToggleComplete = async (
    task: MyTaskItem,
    isCompleted: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const newCompletedAt = isCompleted ? null : new Date().toISOString();
    await updateTaskAction({
      taskId: task.id,
      completedAt: newCompletedAt,
    });

    toast.success(
      isCompleted
        ? `Reopened "${task.title}"`
        : `Marked "${task.title}" as complete`,
      {
        action: {
          label: "Undo",
          onClick: async () => {
            await updateTaskAction({
              taskId: task.id,
              completedAt: isCompleted ? new Date().toISOString() : null,
            });
            router.refresh();
          },
        },
      }
    );
    router.refresh();
  };

  const renderSection = (
    title: string,
    tasks: MyTaskItem[],
    icon: React.ReactNode,
    badgeStyle: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-[#18181B] uppercase tracking-wider">
          {title}
        </h3>
        <span
          className={`text-[11px] font-black px-2 py-0.2 rounded-full border border-[#18181B] ${badgeStyle}`}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-[#18181B]/20 bg-white/50 text-xs text-[#A1A1AA] italic">
          No tasks in this section.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = task.completedAt != null || task.column.isCompletedColumn;

            return (
              <div
                key={task.id}
                onClick={() => handleOpenDetail(task.id)}
                className={`p-3 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isCompleted ? "opacity-60 bg-[#FDFBF7]" : ""
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    onClick={(e) => handleToggleComplete(task, isCompleted, e)}
                    className="p-1 cursor-pointer"
                  >
                    <Checkbox checked={isCompleted} />
                  </div>

                  <span
                    className={`text-xs font-bold text-[#18181B] truncate ${
                      isCompleted ? "line-through text-[#71717A]" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#71717A]">
                    <span
                      className="w-2 h-2 rounded-full border border-[#18181B]"
                      style={{ backgroundColor: task.project.accentColor }}
                    />
                    <span className="hidden sm:inline">{task.project.name}</span>
                  </div>

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

                  {task.dueDate && (
                    <span className="text-[11px] font-semibold text-[#71717A] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b-2 border-[#18181B]">
        <div className="inline-block px-2.5 py-0.5 rounded bg-[#FEF08A] border border-[#18181B] text-[11px] font-black text-[#18181B] mb-1">
          PERSONAL TRIAGE
        </div>
        <h1 className="text-3xl font-black text-[#18181B] tracking-tight">My Tasks</h1>
        <p className="text-xs sm:text-sm text-[#71717A] font-medium">
          Organized chronological view of all items assigned to you.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {renderSection(
          "Overdue",
          overdue,
          <AlertCircle className="w-4 h-4 text-[#DC2626]" />,
          "bg-[#FEE2E2] text-[#DC2626]"
        )}

        {renderSection(
          "Due Today",
          today,
          <Clock className="w-4 h-4 text-[#854D0E]" />,
          "bg-[#FEF08A] text-[#854D0E]"
        )}

        {renderSection(
          "Upcoming",
          upcoming,
          <Calendar className="w-4 h-4 text-[#18181B]" />,
          "bg-[#E0D8FF] text-[#18181B]"
        )}

        {renderSection(
          "Completed",
          completed,
          <CheckCircle2 className="w-4 h-4 text-[#166534]" />,
          "bg-[#D1FAE5] text-[#166534]"
        )}
      </div>

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
