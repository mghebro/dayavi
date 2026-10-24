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
import { Input, Textarea } from "@/components/ui/input";
import { createTaskAction, deleteTaskAction } from "@/server/actions/task";
import { toast } from "sonner";
import { TaskPriority } from "@prisma/client";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();
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
        toast.success(t.tasks.taskCreatedSuccess, {
          action: {
            label: t.common.undo,
            onClick: async () => {
              try {
                await deleteTaskAction(createdTaskId);
                toast.info(t.tasks.taskDeletedSuccess);
              } catch (err) {
                toast.error("Undo failed");
              }
            },
          },
        });

        // Reset and close
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("NONE");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] border-2 border-[#18181B] dark:border-[#3F3F4A] flex items-center justify-center text-white shadow-retro-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.tasks.createTask}</DialogTitle>
              <DialogDescription>
                {t.tasks.quickCreate}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.tasks.taskTitle} *</label>
            <Input
              placeholder={t.tasks.taskTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.common.select} {t.projects.projectName}</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
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
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.tasks.selectColumn}</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
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
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.common.priority}</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="NONE">{t.priorities.NONE}</option>
                <option value="LOW">{t.priorities.LOW}</option>
                <option value="MEDIUM">{t.priorities.MEDIUM}</option>
                <option value="HIGH">{t.priorities.HIGH}</option>
                <option value="URGENT">{t.priorities.URGENT}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.common.dueDate}</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.common.description}</label>
            <Textarea
              placeholder={t.tasks.descriptionPlaceholder}
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
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !title.trim()}
              className="font-bold"
            >
              {isSubmitting ? t.common.loading : t.tasks.createTask}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
