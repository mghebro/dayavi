"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { updateTaskAction } from "@/server/actions/task";
import { toast } from "sonner";
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { TaskPriority } from "@prisma/client";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();

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
          label: t.common.undo,
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
        <h3 className="text-sm font-black text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
          {title}
        </h3>
        <span
          className={`text-[11px] font-black px-2 py-0.2 rounded-full border border-[#18181B] dark:border-[#3F3F4A] ${badgeStyle}`}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-[#18181B]/20 dark:border-[#3F3F4A] bg-white/50 dark:bg-[#15151A] text-xs text-[#A1A1AA] italic">
          {t.views.myTasks.emptyGroup}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = task.completedAt != null || task.column.isCompletedColumn;

            return (
              <div
                key={task.id}
                onClick={() => handleOpenDetail(task.id)}
                className={`p-3 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isCompleted ? "opacity-60 bg-[#FDFBF7] dark:bg-[#15151A]" : ""
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
                    className={`text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate ${
                      isCompleted ? "line-through text-[#71717A] dark:text-[#A1A1AA]" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                    <span
                      className="w-2 h-2 rounded-full border border-[#18181B] dark:border-[#3F3F4A]"
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
                      {t.priorities[task.priority] || task.priority}
                    </Badge>
                  )}

                  {task.dueDate && (
                    <span className="text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#18181B] dark:border-[#3F3F4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#F4F4F5] tracking-tight">
            {t.views.myTasks.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-medium mt-1">
            {t.views.myTasks.subtitle}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Overdue */}
        {overdue.length > 0 &&
          renderSection(
            t.views.myTasks.overdue,
            overdue,
            <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />,
            "bg-[#FEE2E2] dark:bg-[#3D1414] text-[#DC2626] dark:text-[#F87171]"
          )}

        {/* Due Today */}
        {renderSection(
          t.views.myTasks.today,
          today,
          <Clock className="w-4 h-4 text-[#FF6B4A]" />,
          "bg-[#FEF08A] dark:bg-[#3D3512] text-[#854D0E] dark:text-[#FACC15]"
        )}

        {/* Upcoming */}
        {renderSection(
          t.views.myTasks.upcoming,
          upcoming,
          <Calendar className="w-4 h-4 text-[#8B5CF6] dark:text-[#A78BFA]" />,
          "bg-[#E0D8FF] dark:bg-[#2D2350] text-[#6B21A8] dark:text-[#C4B5FD]"
        )}

        {/* Completed */}
        {completed.length > 0 &&
          renderSection(
            t.views.myTasks.completed,
            completed,
            <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />,
            "bg-[#D1FAE5] dark:bg-[#143528] text-[#065F46] dark:text-[#6EE7B7]"
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
