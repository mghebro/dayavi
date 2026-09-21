"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  User,
  Tag,
  MessageSquare,
  History,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  ChevronRight,
  Send,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";

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
  const [manualDesc, setManualDesc] = useState("");

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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  if (!task) return null;

  // Inline Title Save
  const handleTitleBlur = async () => {
    if (title.trim() && title !== task.title) {
      await updateTaskAction({ taskId: task.id, title: title.trim() });
      toast.success("Task title updated");
    }
  };

  // Inline Description Save
  const handleDescriptionBlur = async () => {
    if (description !== (task.description || "")) {
      await updateTaskAction({ taskId: task.id, description: description.trim() });
      toast.success("Description saved");
    }
  };

  // Priority Change
  const handlePriorityChange = async (newPrio: TaskPriority) => {
    setPriority(newPrio);
    await updateTaskAction({ taskId: task.id, priority: newPrio });
    toast.success(`Priority set to ${newPrio}`);
  };

  // Column / Status Change
  const handleColumnChange = async (newColId: string) => {
    setColumnId(newColId);
    await updateTaskAction({ taskId: task.id, columnId: newColId });
    toast.success("Column updated");
    router.refresh();
  };

  // Subtask: Add
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const res = await createSubtaskAction({
      taskId: task.id,
      title: newSubtaskTitle.trim(),
    });

    if (res.success && res.subtask) {
      setSubtasks((prev) => [...prev, res.subtask]);
      setNewSubtaskTitle("");
      toast.success("Subtask added");
    }
  };

  // Subtask: Toggle
  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, completed: !currentCompleted } : s))
    );
    await toggleSubtaskAction({ subtaskId, completed: !currentCompleted });
  };

  // Subtask: Delete
  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    await deleteSubtaskAction(subtaskId);
    toast.success("Subtask removed");
  };

  // Comment: Submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await addCommentAction({
        taskId: task.id,
        content: newComment.trim(),
      });

      if (res.success && res.comment) {
        setComments((prev) => [res.comment as any, ...prev]);
        setNewComment("");
        toast.success("Comment posted");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Stopwatch: Start / Stop
  const handleToggleTimer = async () => {
    if (isTimerRunning) {
      // Stopping timer and saving logged time
      setIsTimerRunning(false);
      if (timerSeconds > 5) {
        await logTimeAction({
          taskId: task.id,
          durationSeconds: timerSeconds,
          description: "Live stopwatch session",
        });
        toast.success(`Logged ${formatDuration(timerSeconds)} to task`);
        setTimerSeconds(0);
        router.refresh();
      } else {
        setTimerSeconds(0);
      }
    } else {
      setIsTimerRunning(true);
      setTimerSeconds(0);
    }
  };

  // Manual Time Log
  const handleManualTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(manualMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;

    const res = await logTimeAction({
      taskId: task.id,
      durationSeconds: mins * 60,
      description: manualDesc || "Manual time entry",
    });

    if (res.success) {
      toast.success(`Logged ${mins} minutes`);
      setManualMinutes("");
      setManualDesc("");
      router.refresh();
    }
  };

  // Dependency: Add
  const handleAddDependency = async () => {
    if (!selectedBlockerId) return;

    try {
      const res = await addDependencyAction({
        blockerId: selectedBlockerId,
        dependentId: task.id,
      });

      if (res.success) {
        toast.success("Dependency linked");
        setSelectedBlockerId("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to link dependency");
      }
    } catch (err: any) {
      toast.error(err.message || "Cycle detected! Cannot add circular dependency.");
    }
  };

  // Task: Delete
  const handleDeleteTask = async () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await deleteTaskAction(task.id);
      toast.success("Task deleted");
      onClose();
      router.refresh();
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtaskRatio = `${completedSubtasksCount} / ${subtasks.length}`;

  const availableBlockers =
    task.project.tasks?.filter(
      (t) =>
        t.id !== task.id &&
        !task.blockedBy.some((dep) => dep.blocker.id === t.id)
    ) || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-white p-6 space-y-6">
        {/* Top bar with project tag & column */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#71717A] uppercase tracking-wider">
              {task.project.name}
            </span>
            <span className="text-[#A1A1AA]">/</span>
            <select
              className="text-xs font-bold rounded border border-[#18181B] bg-[#F5F2EB] px-2 py-0.5"
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
              className="text-[#DC2626] hover:bg-[#FEE2E2]"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <input
            type="text"
            className="w-full text-xl sm:text-2xl font-black text-[#18181B] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#FF6B4A] rounded-md px-1 py-0.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Task Title"
          />
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#FDFBF7] border border-[#18181B]">
          {/* Priority */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] uppercase">Priority</div>
            <select
              className="text-xs font-bold rounded border border-[#18181B] bg-white px-2 py-1 w-full"
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
            >
              <option value="NONE">None</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] uppercase">Assignee</div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {task.assignee ? (
                <>
                  <Avatar className="h-5 w-5">
                    {task.assignee.image && <AvatarImage src={task.assignee.image} />}
                    <AvatarFallback className="text-[9px]">
                      {task.assignee.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-[#A1A1AA]">Unassigned</span>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] uppercase">Due Date</div>
            <div className="text-xs font-bold text-[#18181B] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
              <span>{task.dueDate ? formatDate(task.dueDate) : "No date"}</span>
            </div>
          </div>

          {/* Time Logged */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-[#71717A] uppercase">Time Spent</div>
            <div className="text-xs font-black text-[#10B981] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(task.totalTimeSpent)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="text-xs font-black text-[#18181B]">Description</div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Add detailed markdown notes, requirements, or links..."
            className="text-xs min-h-[90px]"
          />
        </div>

        {/* ----------------------------------------------------
         * SUBTASKS CHECKLIST
         * ---------------------------------------------------- */}
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#18181B]" />
              <span className="text-xs font-black text-[#18181B]">Subtasks</span>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-bold px-1.5 rounded bg-[#FEF08A] border border-[#18181B]">
                  {subtaskRatio}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] border border-[#E4E4E7] text-xs"
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
                    className="h-4 w-4 rounded border-[#18181B] accent-[#10B981] cursor-pointer"
                  />
                  <span className={sub.completed ? "line-through text-[#A1A1AA]" : "text-[#18181B]"}>
                    {sub.title}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteSubtask(sub.id)}
                  className="text-[#A1A1AA] hover:text-[#DC2626] p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <Input
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="submit" variant="outline" size="sm" className="font-bold shrink-0">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </form>
          </div>
        </div>

        {/* ----------------------------------------------------
         * TIME TRACKING (STOPWATCH & MANUAL)
         * ---------------------------------------------------- */}
        <div className="space-y-3 pt-2 border-t border-[#E4E4E7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#18181B]">
              <Clock className="w-4 h-4 text-[#FF6B4A]" />
              <span>Time Tracking</span>
            </div>
            <div className="text-xs font-black text-[#10B981]">
              Total: {formatDuration(task.totalTimeSpent)}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFBF7] border border-[#18181B]">
            <Button
              type="button"
              variant={isTimerRunning ? "danger" : "primary"}
              size="sm"
              onClick={handleToggleTimer}
              className="font-bold gap-1.5"
            >
              {isTimerRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? "Stop Timer" : "Start Timer"}</span>
            </Button>

            {isTimerRunning && (
              <div className="text-sm font-mono font-black text-[#FF6B4A] animate-pulse">
                {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
              </div>
            )}

            <div className="ml-auto text-xs text-[#71717A]">
              Or manual log:
            </div>
            <form onSubmit={handleManualTimeLog} className="flex items-center gap-1.5">
              <Input
                type="number"
                placeholder="Mins"
                className="w-16 h-8 text-xs"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs font-bold">
                Log
              </Button>
            </form>
          </div>
        </div>

        {/* ----------------------------------------------------
         * TASK DEPENDENCIES (WITH DAG CYCLE PREVENTION)
         * ---------------------------------------------------- */}
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7]">
          <div className="flex items-center justify-between text-xs font-black text-[#18181B]">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#8B5CF6]" />
              <span>Dependencies</span>
            </div>
          </div>

          {task.blockedBy.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#DC2626] uppercase">Blocked by:</div>
              {task.blockedBy.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#FFF5F5] border border-[#EF4444] text-xs font-semibold"
                >
                  <span className="text-[#18181B] truncate">🚫 {dep.blocker.title}</span>
                  <button
                    onClick={async () => {
                      await removeDependencyAction(dep.id);
                      toast.success("Dependency removed");
                      router.refresh();
                    }}
                    className="text-[#DC2626] hover:opacity-75 p-1"
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
                className="text-xs rounded border border-[#18181B] bg-white px-2 py-1 flex-1 font-semibold"
                value={selectedBlockerId}
                onChange={(e) => setSelectedBlockerId(e.target.value)}
              >
                <option value="">Select task that blocks this one...</option>
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
                Link
              </Button>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------
         * COMMENTS FEED
         * ---------------------------------------------------- */}
        <div className="space-y-3 pt-2 border-t border-[#E4E4E7]">
          <div className="flex items-center gap-2 text-xs font-black text-[#18181B]">
            <MessageSquare className="w-4 h-4 text-[#18181B]" />
            <span>Comments & Discussion</span>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <Textarea
              placeholder="Leave a comment or update for the team..."
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
                <span>Post Comment</span>
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="text-xs text-[#71717A] italic py-2">
                No comments yet. Start the conversation above.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FDFBF7] border border-[#18181B] space-y-1.5 text-xs shadow-retro-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#18181B]">
                      <Avatar className="h-5 w-5">
                        {c.author.image && <AvatarImage src={c.author.image} />}
                        <AvatarFallback className="text-[9px]">
                          {c.author.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{c.author.name}</span>
                    </div>
                    <span className="text-[10px] text-[#71717A] font-semibold">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#3F3F46] font-medium leading-relaxed whitespace-pre-wrap pl-7">
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
        <div className="space-y-2 pt-2 border-t border-[#E4E4E7]">
          <div className="flex items-center gap-2 text-xs font-black text-[#71717A]">
            <History className="w-4 h-4" />
            <span>Activity History</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#71717A] pl-2 border-l-2 border-[#18181B]">
            {task.activities.map((act) => (
              <div key={act.id} className="py-0.5">
                <span className="font-bold text-[#18181B]">{act.actor.name}</span>{" "}
                <span>performed {act.action}</span>{" "}
                <span className="text-[#A1A1AA]">• {formatDate(act.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
