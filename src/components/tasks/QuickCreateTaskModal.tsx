"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { createTaskAction, deleteTaskAction } from "@/server/actions/task";
import { toast } from "sonner";
import { TaskPriority } from "@prisma/client";
import { Plus, Sparkles } from "lucide-react";

interface QuickCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    boards: Array<{
      id: string;
      columns: Array<{ id: string; name: string }>;
    }>;
  }>;
  defaultProjectId?: string;
  defaultColumnId?: string;
}

export function QuickCreateTaskModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  defaultColumnId,
}: QuickCreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || "");
  const [columnId, setColumnId] = useState(defaultColumnId || "");
  const [priority, setPriority] = useState<TaskPriority>("NONE");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default project and column
  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];
  const board = selectedProject?.boards[0];
  const columns = board?.columns || [];

  useEffect(() => {
    if (defaultColumnId) {
      setColumnId(defaultColumnId);
    } else if (columns.length > 0 && !columnId) {
      setColumnId(columns[0].id);
    }
  }, [columns, defaultColumnId, columnId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProject || !board || !columnId) return;

    setIsSubmitting(true);
    try {
      const res = await createTaskAction({
        projectId: selectedProject.id,
        boardId: board.id,
        columnId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      if (res.success && res.task) {
        const createdTaskId = res.task.id;
        const taskTitle = res.task.title;

        toast.success(`Created task "${taskTitle}"`, {
          action: {
            label: "Undo",
            onClick: async () => {
              await deleteTaskAction(createdTaskId);
              toast.info(`Undid creation of "${taskTitle}"`);
            },
          },
        });

        // Reset and close
        setTitle("");
        setDescription("");
        setDueDate("");
        onClose();
      } else {
        toast.error("Failed to create task.");
      }
    } catch (err) {
      toast.error("An error occurred while creating task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] border-2 border-[#18181B] flex items-center justify-center text-white font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Task</DialogTitle>
              <DialogDescription>
                Quickly add a task to your project workflow.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Task Title *</label>
            <Input
              placeholder="e.g., Redesign landing page navigation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Project</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] bg-white px-3 py-2 text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  const newProj = projects.find((p) => p.id === e.target.value);
                  if (newProj?.boards[0]?.columns[0]) {
                    setColumnId(newProj.boards[0].columns[0].id);
                  }
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Column / State</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] bg-white px-3 py-2 text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Priority</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] bg-white px-3 py-2 text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="NONE">No Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Description (Optional)</label>
            <Textarea
              placeholder="Add markdown notes, context, or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !title.trim()}
              className="font-bold"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
