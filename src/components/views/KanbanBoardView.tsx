"use client";

import React, { useState, useTransition } from "react";
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
  Clock,
  CheckSquare,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenDetail(task.id)}
      className={`group relative p-3.5 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-30 border-dashed" : ""
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
              {task.priority}
            </Badge>
          )}

          {isBlocked && (
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FEE2E2] border border-[#EF4444] text-[#DC2626]">
              BLOCKED
            </span>
          )}
        </div>

        {/* Non-pointer accessible move menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#F5F2EB] text-[#71717A] hover:text-[#18181B] transition-opacity"
              title="Card options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="text-[10px] font-black text-[#71717A] uppercase px-2 py-1">
              Move to column:
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
      <h4 className="text-xs sm:text-sm font-black text-[#18181B] leading-snug mb-3">
        {task.title}
      </h4>

      {/* Footer metadata: Due date, subtask progress, assignee */}
      <div className="flex items-center justify-between text-[10px] font-bold text-[#71717A] pt-2 border-t border-[#E4E4E7]">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-[#DC2626] font-extrabold" : ""
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1 text-[#52525B]">
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}
        </div>

        {task.assignee ? (
          <Avatar className="h-5 w-5 border border-[#18181B]">
            {task.assignee.image && <AvatarImage src={task.assignee.image} />}
            <AvatarFallback className="text-[9px] font-black">
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
        toast.success(`Task created in ${column.name}`, {
          action: {
            label: "Undo",
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
    <div className="w-72 sm:w-80 shrink-0 bg-[#F5F2EB] rounded-2xl border-2 border-[#18181B] flex flex-col max-h-[calc(100vh-14rem)] shadow-retro-sm">
      {/* Column Header */}
      <div className="p-3.5 border-b-2 border-[#18181B] bg-[#FDFBF7] rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#18181B] uppercase tracking-wider">
            {column.name}
          </span>
          <span
            className={`text-[11px] font-extrabold px-2 py-0.2 rounded-full border border-[#18181B] ${
              isWipExceeded ? "bg-[#EF4444] text-white" : "bg-white text-[#18181B]"
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
          className="hover:bg-white hover:border border-[#18181B]"
          title="Add task"
        >
          <Plus className="w-4 h-4 text-[#18181B]" />
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
          <div className="p-6 text-center border-2 border-dashed border-[#18181B]/20 rounded-xl text-xs text-[#A1A1AA] font-bold">
            Drop tasks here or click + to add
          </div>
        )}

        {/* Quick inline task add input */}
        {isAddingTask && (
          <form
            onSubmit={handleQuickCreate}
            className="p-3 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm space-y-2 animate-in fade-in-50"
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              className="w-full text-xs font-bold text-[#18181B] focus:outline-none placeholder:text-[#A1A1AA]"
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
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !taskTitle.trim()}
                className="h-7 text-xs font-bold"
              >
                Add Task
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer */}
      {!isAddingTask && (
        <div className="p-2.5 border-t border-[#E4E4E7] bg-[#FDFBF7] rounded-b-2xl">
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] hover:bg-white rounded-lg border border-transparent hover:border-[#18181B] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
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

  // Sync state if initialColumns update
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

    // Find current source & target columns
    const sourceCol = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    let targetCol = columns.find((c) => c.tasks.some((t) => t.id === overId));

    if (!targetCol) {
      targetCol = columns.find((c) => c.id === overId);
    }

    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) return;

    // Optimistically update column position
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

    // Find column containing active task
    const col = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    if (!col) return;

    const activeIndex = col.tasks.findIndex((t) => t.id === activeId);
    const prevTask = col.tasks[activeIndex - 1];
    const nextTask = col.tasks[activeIndex + 1];

    // Persist to database via server action
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
            <div className="p-3.5 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-lg rotate-2 scale-105 pointer-events-none">
              <h4 className="text-xs sm:text-sm font-black text-[#18181B]">
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
