"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  updateTaskAction,
  deleteTaskAction,
  createSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction,
  addCommentAction,
  logTimeAction,
  addDependencyAction,
  removeDependencyAction,
} from "@/server/actions/task";
import { toast } from "sonner";
import {
  Clock,
  Play,
  Square,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  MessageSquare,
  History,
  Link as LinkIcon,
  Send,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";
import { useTranslation } from "@/lib/i18n/context";

export interface TaskDetailData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: TaskPriority;
  totalTimeSpent: number;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  projectId: string;
  project: {
    id: string;
    name: string;
    slug: string;
    workspace: { id: string; slug: string };
    members?: Array<{ user: { id: string; name: string | null; email: string; image: string | null } }>;
    tasks?: Array<{ id: string; title: string }>;
  };
  board: {
    id: string;
    columns: Array<{ id: string; name: string }>;
  };
  column: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  assignee?: {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
  } | null;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    orderIndex: number;
  }>;
  labels: Array<{
    label: { id: string; name: string; color: string };
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    author: { id: string; name: string | null; image: string | null };
  }>;
  timeEntries: Array<{
    id: string;
    duration: number;
    description?: string | null;
    createdAt: Date | string;
    user: { name: string | null };
  }>;
  blockedBy: Array<{
    id: string;
    blocker: { id: string; title: string; status: string };
  }>;
  blocking: Array<{
    id: string;
    dependent: { id: string; title: string; status: string };
  }>;
  activities: Array<{
    id: string;
    action: string;
    createdAt: Date | string;
    actor: { name: string | null };
  }>;
}

interface TaskDetailDrawerProps {
  task: TaskDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  currentUserId,
}: TaskDetailDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Local state for inline editable fields
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "NONE");
  const [columnId, setColumnId] = useState(task?.column?.id || "");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual Time Entry
  const [manualMinutes, setManualMinutes] = useState("");

  // Dependency add state
  const [selectedBlockerId, setSelectedBlockerId] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setColumnId(task.column?.id || "");
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    }
  }, [task]);

  // Live Stopwatch ticker
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  if (!task) return null;

  const handleTitleBlur = async () => {
    if (!title.trim() || title === task.title) return;
    try {
      await updateTaskAction({ taskId: task.id, title: title.trim() });
      toast.success(t.tasks.taskUpdatedSuccess);
    } catch {
      toast.error("Failed to update title");
      setTitle(task.title);
    }
  };

  const handleDescriptionBlur = async () => {
    if (description === (task.description || "")) return;
    try {
      await updateTaskAction({ taskId: task.id, description: description.trim() });
      toast.success(t.tasks.taskUpdatedSuccess);
    } catch {
      toast.error("Failed to update description");
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority);
    try {
      await updateTaskAction({ taskId: task.id, priority: newPriority });
      toast.success(t.tasks.taskUpdatedSuccess);
    } catch {
      toast.error("Failed to update priority");
      setPriority(task.priority);
    }
  };

  const handleColumnChange = async (newColumnId: string) => {
    setColumnId(newColumnId);
    try {
      await updateTaskAction({ taskId: task.id, columnId: newColumnId });
      toast.success(t.tasks.taskUpdatedSuccess);
      router.refresh();
    } catch {
      toast.error("Failed to update column");
      setColumnId(task.column?.id || "");
    }
  };

  const handleDeleteTask = async () => {
    if (confirm(t.tasks.deleteTaskConfirm)) {
      try {
        await deleteTaskAction(task.id);
        toast.success(t.tasks.taskDeletedSuccess);
        onClose();
        router.refresh();
      } catch {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await createSubtaskAction({
        taskId: task.id,
        title: newSubtaskTitle.trim(),
      });
      if (res.success && res.subtask) {
        setSubtasks((prev) => [...prev, res.subtask]);
        setNewSubtaskTitle("");
      }
    } catch {
      toast.error("Failed to create subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, completed: !currentCompleted } : s))
    );
    try {
      await toggleSubtaskAction({ subtaskId, completed: !currentCompleted });
    } catch {
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, completed: currentCompleted } : s))
      );
      toast.error("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    try {
      await deleteSubtaskAction(subtaskId);
    } catch {
      toast.error("Failed to delete subtask");
    }
  };

  const handleToggleTimer = async () => {
    if (!isTimerRunning) {
      setTimerSeconds(0);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      if (timerSeconds > 5) {
        try {
          await logTimeAction({
            taskId: task.id,
            duration: timerSeconds,
            description: "Stopwatch session",
          });
          toast.success(`Logged ${formatDuration(timerSeconds)}`);
          router.refresh();
        } catch {
          toast.error("Failed to log timer duration");
        }
      }
      setTimerSeconds(0);
    }
  };

  const handleManualTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(manualMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;

    try {
      await logTimeAction({
        taskId: task.id,
        duration: mins * 60,
        description: "Manual log",
      });
      toast.success(`Logged ${mins} minutes`);
      setManualMinutes("");
      router.refresh();
    } catch {
      toast.error("Failed to log time");
    }
  };

  const handleAddDependency = async () => {
    if (!selectedBlockerId) return;
    try {
      const res = await addDependencyAction({
        blockerId: selectedBlockerId,
        dependentId: task.id,
      });
      if (res.success) {
        toast.success("Dependency added");
        setSelectedBlockerId("");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || t.tasks.cycleDetected);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await addCommentAction({
        taskId: task.id,
        content: newComment.trim(),
      });
      if (res.success && res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setNewComment("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtaskRatio = `${completedSubtasksCount} / ${subtasks.length}`;

  const availableBlockers =
    task.project.tasks?.filter(
      (tItem) =>
        tItem.id !== task.id &&
        !task.blockedBy.some((dep) => dep.blocker.id === tItem.id)
    ) || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#18181D] text-[#18181B] dark:text-[#F4F4F5] p-6 space-y-6">
        {/* Top bar with project tag & column */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              {task.project.name}
            </span>
            <span className="text-[#A1A1AA]">/</span>
            <select
              className="text-xs font-bold rounded border border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5] px-2 py-0.5"
              value={columnId}
              onChange={(e) => handleColumnChange(e.target.value)}
            >
              {task.board.columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDeleteTask}
              className="text-[#DC2626] dark:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1414]"
              title={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <input
            type="text"
            className="w-full text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#F4F4F5] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#FF6B4A] rounded-md px-1 py-0.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder={t.tasks.taskTitle}
          />
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#15151A] border border-[#18181B] dark:border-[#3F3F4A]">
          {/* Priority */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase">{t.common.priority}</div>
            <select
              className="text-xs font-bold rounded border border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5] px-2 py-1 w-full"
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
            >
              <option value="NONE">{t.priorities.NONE}</option>
              <option value="LOW">{t.priorities.LOW}</option>
              <option value="MEDIUM">{t.priorities.MEDIUM}</option>
              <option value="HIGH">{t.priorities.HIGH}</option>
              <option value="URGENT">{t.priorities.URGENT}</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase">{t.common.assignee}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
              {task.assignee ? (
                <>
                  <Avatar className="h-5 w-5 border border-[#18181B] dark:border-[#3F3F4A]">
                    {task.assignee.image && <AvatarImage src={task.assignee.image} />}
                    <AvatarFallback className="text-[9px] bg-[#FF6B4A] text-white">
                      {task.assignee.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-[#A1A1AA]">{t.common.unassigned}</span>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase">{t.common.dueDate}</div>
            <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#71717A] dark:text-[#A1A1AA]" />
              <span>{task.dueDate ? formatDate(task.dueDate) : "—"}</span>
            </div>
          </div>

          {/* Time Logged */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase">{t.tasks.totalTimeSpent}</div>
            <div className="text-xs font-black text-[#10B981] dark:text-[#34D399] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(task.totalTimeSpent)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">{t.common.description}</div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder={t.tasks.descriptionPlaceholder}
            className="text-xs min-h-[90px]"
          />
        </div>

        {/* ----------------------------------------------------
         * SUBTASKS CHECKLIST
         * ---------------------------------------------------- */}
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
              <span className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">{t.tasks.subtasks}</span>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-bold px-1.5 rounded bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] border border-[#18181B] dark:border-[#FACC15]">
                  {subtaskRatio}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] dark:bg-[#15151A] border border-[#E4E4E7] dark:border-[#2E2E38] text-xs"
              >
                <button
                  type="button"
                  onClick={() => handleToggleSubtask(sub.id, sub.completed)}
                  className="flex items-center gap-2.5 text-left font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-[#18181B] dark:border-[#3F3F4A] accent-[#10B981] cursor-pointer"
                  />
                  <span className={sub.completed ? "line-through text-[#A1A1AA]" : "text-[#18181B] dark:text-[#F4F4F5]"}>
                    {sub.title}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteSubtask(sub.id)}
                  className="text-[#A1A1AA] hover:text-[#DC2626] dark:hover:text-[#EF4444] p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <Input
                placeholder={t.tasks.newSubtaskPlaceholder}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="submit" variant="outline" size="sm" className="font-bold shrink-0">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t.tasks.addSubtask}
              </Button>
            </form>
          </div>
        </div>

        {/* ----------------------------------------------------
         * TIME TRACKING (STOPWATCH & MANUAL)
         * ---------------------------------------------------- */}
        <div className="space-y-3 pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
              <Clock className="w-4 h-4 text-[#FF6B4A]" />
              <span>{t.tasks.timeTracking}</span>
            </div>
            <div className="text-xs font-black text-[#10B981] dark:text-[#34D399]">
              Total: {formatDuration(task.totalTimeSpent)}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#15151A] border border-[#18181B] dark:border-[#3F3F4A]">
            <Button
              type="button"
              variant={isTimerRunning ? "danger" : "primary"}
              size="sm"
              onClick={handleToggleTimer}
              className="font-bold gap-1.5"
            >
              {isTimerRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? t.tasks.stopTimer : t.tasks.startTimer}</span>
            </Button>

            {isTimerRunning && (
              <div className="text-sm font-mono font-black text-[#FF6B4A] animate-pulse">
                {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
              </div>
            )}

            <div className="ml-auto text-xs text-[#71717A] dark:text-[#A1A1AA]">
              {t.tasks.manualLog}:
            </div>
            <form onSubmit={handleManualTimeLog} className="flex items-center gap-1.5">
              <Input
                type="number"
                placeholder={t.tasks.durationMinutes}
                className="w-20 h-8 text-xs"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs font-bold">
                {t.tasks.logTime}
              </Button>
            </form>
          </div>
        </div>

        {/* ----------------------------------------------------
         * TASK DEPENDENCIES (WITH DAG CYCLE PREVENTION)
         * ---------------------------------------------------- */}
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center justify-between text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#8B5CF6] dark:text-[#A78BFA]" />
              <span>{t.tasks.dependencies}</span>
            </div>
          </div>

          {task.blockedBy.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#DC2626] dark:text-[#EF4444] uppercase">{t.tasks.blockedBy}</div>
              {task.blockedBy.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#FFF5F5] dark:bg-[#3D1414] border border-[#EF4444] text-xs font-semibold"
                >
                  <span className="text-[#18181B] dark:text-[#F4F4F5] truncate">🚫 {dep.blocker.title}</span>
                  <button
                    onClick={async () => {
                      await removeDependencyAction(dep.id);
                      toast.success("Dependency removed");
                      router.refresh();
                    }}
                    className="text-[#DC2626] dark:text-[#EF4444] hover:opacity-75 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableBlockers.length > 0 && (
            <div className="flex gap-2 pt-1">
              <select
                className="text-xs rounded border border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5] px-2 py-1 flex-1 font-semibold"
                value={selectedBlockerId}
                onChange={(e) => setSelectedBlockerId(e.target.value)}
              >
                <option value="">{t.tasks.addDependency}...</option>
                {availableBlockers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDependency}
                disabled={!selectedBlockerId}
                className="font-bold shrink-0"
              >
                {t.common.actions}
              </Button>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------
         * COMMENTS FEED
         * ---------------------------------------------------- */}
        <div className="space-y-3 pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center gap-2 text-xs font-black text-[#18181B] dark:text-[#F4F4F5]">
            <MessageSquare className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
            <span>{t.tasks.comments}</span>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <Textarea
              placeholder={t.tasks.writeCommentPlaceholder}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-xs min-h-[60px]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newComment.trim() || isSubmittingComment}
                className="font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.tasks.addComment}</span>
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] italic py-2">
                {t.tasks.noComments}
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FDFBF7] dark:bg-[#15151A] border border-[#18181B] dark:border-[#3F3F4A] space-y-1.5 text-xs shadow-retro-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      <Avatar className="h-5 w-5 border border-[#18181B] dark:border-[#3F3F4A]">
                        {c.author.image && <AvatarImage src={c.author.image} />}
                        <AvatarFallback className="text-[9px] bg-[#FF6B4A] text-white">
                          {c.author.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{c.author.name}</span>
                    </div>
                    <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-semibold">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#3F3F46] dark:text-[#D4D4D8] font-medium leading-relaxed whitespace-pre-wrap pl-7">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ----------------------------------------------------
         * IMMUTABLE ACTIVITY AUDIT TIMELINE
         * ---------------------------------------------------- */}
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center gap-2 text-xs font-black text-[#71717A] dark:text-[#A1A1AA]">
            <History className="w-4 h-4" />
            <span>{t.tasks.activityHistory}</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#71717A] dark:text-[#A1A1AA] pl-2 border-l-2 border-[#18181B] dark:border-[#3F3F4A]">
            {task.activities.map((act) => (
              <div key={act.id} className="py-0.5">
                <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{act.actor.name}</span>{" "}
                <span>{act.action}</span>{" "}
                <span className="text-[#A1A1AA]">• {formatDate(act.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
