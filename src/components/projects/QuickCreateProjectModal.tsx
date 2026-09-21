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
        status,
        accentColor,
      });

      if (res.success && res.project) {
        toast.success(`Created project "${res.project.name}"`);
        setName("");
        setSlug("");
        setDescription("");
        onClose();
        router.push(`/app/${workspaceSlug}/projects/${res.project.slug}/board`);
      } else {
        toast.error(res.error || "Failed to create project.");
      }
    } catch (err) {
      toast.error("An error occurred while creating project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0D8FF] border-2 border-[#18181B] flex items-center justify-center text-[#18181B] font-bold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Project</DialogTitle>
              <DialogDescription>
                Initiate a project pipeline with automated Kanban workflow.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Project Name *</label>
            <Input
              placeholder="e.g. Design System v2"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">URL Slug *</label>
            <Input
              placeholder="design-system-v2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Status</label>
              <select
                className="flex h-10 w-full rounded-lg border-2 border-[#18181B] bg-white px-3 py-2 text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Accent Color</label>
              <div className="flex items-center gap-2 h-10">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    className={`w-6 h-6 rounded-full border-2 border-[#18181B] transition-transform ${
                      accentColor === c ? "scale-125 shadow-retro-sm" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Description</label>
            <Textarea
              placeholder="Brief description of the project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[60px]"
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
              disabled={isSubmitting || !name.trim()}
              className="font-bold"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
