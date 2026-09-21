"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProjectAction, deleteProjectAction } from "@/server/actions/project";
import { toast } from "sonner";
import { ProjectStatus } from "@prisma/client";
import { Trash2, AlertTriangle } from "lucide-react";

interface ProjectSettingsFormProps {
  project: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    status: ProjectStatus;
    accentColor: string;
  };
  workspaceSlug: string;
}

const ACCENT_COLORS = ["#FF6B4A", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EC4899"];

export function ProjectSettingsForm({
  project,
  workspaceSlug,
}: ProjectSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [accentColor, setAccentColor] = useState(project.accentColor);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProjectAction({
        projectId: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        accentColor,
      });

      if (res.success) {
        toast.success("Project settings updated");
        router.refresh();
      } else {
        toast.error("Failed to update project settings.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      try {
        const res = await deleteProjectAction(project.id);
        if (res.success) {
          toast.success("Project deleted");
          router.push(`/app/${workspaceSlug}/projects`);
          router.refresh();
        } else {
          toast.error("Failed to delete project.");
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#18181B] shadow-retro bg-white">
        <CardHeader className="border-b border-[#E4E4E7]">
          <CardTitle className="text-lg font-black">Project Details</CardTitle>
          <CardDescription className="text-xs">
            Manage initiative metadata and workflow parameters.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Project Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#18181B]">Status</label>
                <select
                  className="flex h-10 w-full rounded-lg border-2 border-[#18181B] bg-white px-3 py-2 text-xs font-bold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
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
                        accentColor === c
                          ? "scale-125 shadow-retro-sm"
                          : "opacity-70 hover:opacity-100"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-6 pt-0">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="font-bold"
            >
              {isSaving ? "Saving changes..." : "Save Project Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-[#EF4444] shadow-retro bg-[#FFF5F5]">
        <CardHeader className="border-b border-[#EF4444]/20">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-base font-black">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#DC2626]/80">
            Permanently delete this project and all associated tasks, boards, and comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#18181B]">Delete this project</div>
            <div className="text-[11px] text-[#71717A]">
              Once deleted, all data is permanently unrecoverable.
            </div>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-bold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
