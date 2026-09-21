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
import { createWorkspaceAction } from "@/server/actions/workspace";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

interface QuickCreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKSPACE_COLORS = [
  "#8B5CF6", // Lavender / Violet
  "#FF6B4A", // Coral
  "#10B981", // Sage / Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#0F172A", // Dark Slate
];

export function QuickCreateWorkspaceModal({
  isOpen,
  onClose,
}: QuickCreateWorkspaceModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState(WORKSPACE_COLORS[0]);
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
      const res = await createWorkspaceAction({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        accentColor,
      });

      if (res.success && res.workspace) {
        toast.success(`Created workspace "${res.workspace.name}"`);
        setName("");
        setSlug("");
        setDescription("");
        onClose();
        router.push(`/app/${res.workspace.slug}/dashboard`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create workspace.");
      }
    } catch (err) {
      toast.error("An error occurred while creating workspace.");
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Workspace</DialogTitle>
              <DialogDescription>
                A dedicated organizational home for your team and projects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Workspace Name *</label>
            <Input
              placeholder="e.g. Acme Creative Studio"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Workspace Slug *</label>
            <Input
              placeholder="acme-creative-studio"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Brand Accent Color</label>
            <div className="flex items-center gap-2 h-10">
              {WORKSPACE_COLORS.map((c) => (
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Description</label>
            <Textarea
              placeholder="Optional overview of the workspace..."
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
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
