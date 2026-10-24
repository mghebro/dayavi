"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { moveTaskAction, createTaskAction, deleteTaskAction } from "@/server/actions/task";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { useTranslation } from "@/lib/i18n/context";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: string;
  orderIndex: number;
  columnId: string;
  dueDate?: Date | string | null;
  startDate?: Date | string | null;
  totalTimeSpent: number;
  assignee?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count: {
    subtasks: number;
    comments: number;
  };
  subtasks?: Array<{ completed: boolean }>;
  blockedBy?: Array<{ id: string }>;
}

export interface KanbanColumnData {
  id: string;
  name: string;
  orderIndex: number;
  wipLimit?: number | null;
  isCompletedColumn: boolean;
  tasks: KanbanTask[];
}

interface KanbanBoardViewProps {
  columns: KanbanColumnData[];
  projectId: string;
  boardId: string;
  currentUserId: string;
  activeTaskDetail?: TaskDetailData | null;
}

// ------------------------------------------------------
// TASK CARD (DRAGGABLE)
// ------------------------------------------------------

function TaskCard({
  task,
  columns,
  onOpenDetail,
}: {
  task: KanbanTask;
  columns: KanbanColumnData[];
  onOpenDetail: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task._count?.subtasks || 0;

  const isBlocked = task.blockedBy && task.blockedBy.length > 0;

  const priorityLabel = t.priorities[task.priority] || task.priority;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenDetail(task.id)}
      className={`group relative p-3.5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-30 border-dashed border-[#FF6B4A]" : ""
      }`}
    >
      {/* Top badges: priority, blocked indicator */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
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
              {priorityLabel}
            </Badge>
          )}

          {isBlocked && (
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FEE2E2] dark:bg-[#3D1414] border border-[#EF4444] text-[#DC2626] dark:text-[#F87171]">
              BLOCKED
            </span>
          )}
        </div>

        {/* Non-pointer accessible move menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#F5F2EB] dark:hover:bg-[#202029] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-opacity"
              title="Card options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase px-2 py-1">
              {t.common.actions}:
            </div>
            {columns.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={async (e) => {
                  e.stopPropagation();
                  await moveTaskAction({
                    taskId: task.id,
                    targetColumnId: c.id,
                  });
                  toast.success(`Moved to ${c.name}`);
                }}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Title */}
      <h4 className="text-xs sm:text-sm font-black text-[#18181B] dark:text-[#F4F4F5] leading-snug mb-3">
        {task.title}
      </h4>

      {/* Footer metadata: Due date, subtask progress, assignee */}
      <div className="flex items-center justify-between text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA] pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-[#DC2626] dark:text-[#F87171] font-extrabold" : ""
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1 text-[#52525B] dark:text-[#A1A1AA]">
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}
        </div>

        {task.assignee ? (
          <Avatar className="h-5 w-5 border border-[#18181B] dark:border-[#3F3F4A]">
            {task.assignee.image && <AvatarImage src={task.assignee.image} />}
            <AvatarFallback className="text-[9px] font-black bg-[#FF6B4A] text-white">
              {task.assignee.name?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// KANBAN COLUMN
// ------------------------------------------------------

function KanbanColumn({
  column,
  columns,
  projectId,
  boardId,
  onOpenDetail,
}: {
  column: KanbanColumnData;
  columns: KanbanColumnData[];
  projectId: string;
  boardId: string;
  onOpenDetail: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isWipExceeded =
    column.wipLimit != null && column.tasks.length > column.wipLimit;

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createTaskAction({
        projectId,
        boardId,
        columnId: column.id,
        title: taskTitle.trim(),
        prevOrder: column.tasks[column.tasks.length - 1]?.orderIndex ?? null,
      });

      if (res.success && res.task) {
        toast.success(t.tasks.taskCreatedSuccess, {
          action: {
            label: t.common.undo,
            onClick: async () => {
              await deleteTaskAction(res.task.id);
            },
          },
        });
        setTaskTitle("");
        setIsAddingTask(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-72 sm:w-80 shrink-0 bg-[#F5F2EB] dark:bg-[#15151A] rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] flex flex-col max-h-[calc(100vh-14rem)] shadow-retro-sm">
      {/* Column Header */}
      <div className="p-3.5 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#18181D] rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
            {column.name}
          </span>
          <span
            className={`text-[11px] font-extrabold px-2 py-0.2 rounded-full border border-[#18181B] dark:border-[#3F3F4A] ${
              isWipExceeded ? "bg-[#EF4444] text-white" : "bg-white dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5]"
            }`}
          >
            {column.tasks.length}
            {column.wipLimit && ` / ${column.wipLimit}`}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsAddingTask(true)}
          className="hover:bg-white dark:hover:bg-[#202029] hover:border border-[#18181B] dark:border-[#3F3F4A]"
          title={t.views.kanban.quickAddTask}
        >
          <Plus className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
        </Button>
      </div>

      {/* Task Cards List */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[140px]">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && !isAddingTask && (
          <div className="py-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA] italic">
            {t.views.kanban.emptyColumn}
          </div>
        )}

        {isAddingTask && (
          <form
            onSubmit={handleQuickCreate}
            className="p-3 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-sm space-y-2 animate-in fade-in-50"
          >
            <input
              type="text"
              placeholder={t.tasks.taskTitlePlaceholder}
              className="w-full text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] bg-transparent focus:outline-none placeholder:text-[#A1A1AA] dark:placeholder:text-[#71717A]"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingTask(false);
                  setTaskTitle("");
                }}
                disabled={isSubmitting}
                className="h-7 text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !taskTitle.trim()}
                className="h-7 text-xs font-bold"
              >
                {t.common.create}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer */}
      {!isAddingTask && (
        <div className="p-2.5 border-t border-[#E4E4E7] dark:border-[#2E2E38] bg-[#FDFBF7] dark:bg-[#18181D] rounded-b-2xl">
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#202029] rounded-lg border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.views.kanban.quickAddTask}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------
// MAIN KANBAN BOARD VIEW
// ------------------------------------------------------

export function KanbanBoardView({
  columns: initialColumns,
  projectId,
  boardId,
  currentUserId,
  activeTaskDetail,
}: KanbanBoardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    let targetCol = columns.find((c) => c.tasks.some((t) => t.id === overId));

    if (!targetCol) {
      targetCol = columns.find((c) => c.id === overId);
    }

    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) return;

    setColumns((prev) => {
      const movingTask = sourceCol.tasks.find((t) => t.id === activeId)!;
      return prev.map((c) => {
        if (c.id === sourceCol.id) {
          return { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) };
        }
        if (c.id === targetCol.id) {
          return { ...c, tasks: [...c.tasks, { ...movingTask, columnId: targetCol.id }] };
        }
        return c;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const col = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    if (!col) return;

    const activeIndex = col.tasks.findIndex((t) => t.id === activeId);
    const prevTask = col.tasks[activeIndex - 1];
    const nextTask = col.tasks[activeIndex + 1];

    try {
      await moveTaskAction({
        taskId: activeId,
        targetColumnId: col.id,
        prevOrder: prevTask?.orderIndex ?? null,
        nextOrder: nextTask?.orderIndex ?? null,
      });
    } catch (err) {
      toast.error("Failed to move task. Reverting...");
      setColumns(initialColumns);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 select-none">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              columns={columns}
              projectId={projectId}
              boardId={boardId}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-3.5 rounded-xl border-2 border-[#18181B] dark:border-[#FF6B4A] bg-white dark:bg-[#18181D] shadow-retro-lg rotate-2 scale-105 pointer-events-none">
              <h4 className="text-xs sm:text-sm font-black text-[#18181B] dark:text-[#F4F4F5]">
                {activeTask.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Slide-Over Drawer */}
      <TaskDetailDrawer
        task={activeTaskDetail || null}
        isOpen={!!searchParams.get("taskId") && !!activeTaskDetail}
        onClose={handleCloseDetail}
        currentUserId={currentUserId}
      />
    </>
  );
}
