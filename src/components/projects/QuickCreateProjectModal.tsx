"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createProjectAction } from "@/server/actions/project";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";
import { ProjectStatus } from "@prisma/client";
import { useTranslation } from "@/lib/i18n/context";

interface QuickCreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceSlug: string;
}

const ACCENT_COLORS = [
  "#FF6B4A", // Coral
  "#8B5CF6", // Lavender / Violet
  "#10B981", // Sage / Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EC4899", // Pink
];

export function QuickCreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceSlug,
}: QuickCreateProjectModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createProjectAction({
        workspaceId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        accentColor,
        status,
      });

      if (res.success && res.project) {
        toast.success(`Created project "${res.project.name}"`);
        setName("");
        setSlug("");
        setDescription("");
        onClose();
        router.push(`/app/${workspaceSlug}/projects/${res.project.slug}/board`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create project");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0D8FF] dark:bg-[#2D2350] border-2 border-[#18181B] dark:border-[#3F3F4A] flex items-center justify-center text-[#18181B] dark:text-[#C4B5FD] shadow-retro-sm">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.projects.createProject}</DialogTitle>
              <DialogDescription>
                {t.projects.newProject}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.projects.projectName} *</label>
            <Input
              placeholder={t.projects.projectNamePlaceholder}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.projects.projectSlug} *</label>
            <div className="flex items-center">
              <span className="px-2.5 py-2 rounded-l-lg border-2 border-r-0 border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#202029] text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">
                /projects/
              </span>
              <input
                type="text"
                className="flex h-10 w-full rounded-r-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#15151A] px-3 py-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.projects.projectDescription}</label>
            <Textarea
              placeholder={t.projects.projectDescriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.projects.accentColor}</label>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setAccentColor(col)}
                  className={`w-7 h-7 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] transition-transform ${
                    accentColor === col ? "scale-110 shadow-retro-sm" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
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
              disabled={isSubmitting || !name.trim() || !slug.trim()}
              className="font-bold"
            >
              {isSubmitting ? t.common.loading : t.projects.createProject}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
