"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  updateWorkspaceAction,
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  deleteWorkspaceAction,
} from "@/server/actions/workspace";
import { toast } from "sonner";
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { WorkspaceRole } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface WorkspaceMemberItem {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: WorkspaceRole;
  joinedAt: Date | string;
}

interface WorkspaceSettingsClientViewProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    accentColor: string;
  };
  members: WorkspaceMemberItem[];
  currentRole: WorkspaceRole;
  currentUserId: string;
}

const WORKSPACE_COLORS = [
  "#8B5CF6",
  "#FF6B4A",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#0F172A",
];

export function WorkspaceSettingsClientView({
  workspace,
  members,
  currentRole,
  currentUserId,
}: WorkspaceSettingsClientViewProps) {
  const router = useRouter();

  // General settings state
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || "");
  const [accentColor, setAccentColor] = useState(workspace.accentColor);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  // Delete state
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";
  const isOwner = currentRole === "OWNER";

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    setIsSavingGeneral(true);
    try {
      const res = await updateWorkspaceAction({
        workspaceId: workspace.id,
        name: name.trim(),
        description: description.trim() || undefined,
        accentColor,
      });

      if (res.success) {
        toast.success("Workspace settings updated");
        router.refresh();
      } else {
        toast.error("Failed to update workspace settings.");
      }
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !canManage) return;

    setIsInviting(true);
    try {
      const res = await inviteMemberAction({
        workspaceId: workspace.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success) {
        toast.success(`Invited ${inviteEmail} to workspace`);
        setInviteEmail("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to invite teammate.");
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    if (!canManage) return;

    const res = await updateMemberRoleAction({
      workspaceId: workspace.id,
      memberId,
      role: newRole,
    });

    if (res.success) {
      toast.success("Member role updated");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to change role.");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string | null) => {
    if (!canManage) return;
    if (confirm(`Remove ${memberName || "this member"} from the workspace?`)) {
      const res = await removeMemberAction(workspace.id, memberId);
      if (res.success) {
        toast.success("Member removed");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove member.");
      }
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!isOwner) return;
    if (
      confirm(
        `Are you sure you want to permanently delete "${workspace.name}"? All projects, tasks, and data will be permanently destroyed.`
      )
    ) {
      setIsDeletingWorkspace(true);
      try {
        const res = await deleteWorkspaceAction(workspace.id);
        if (res.success) {
          toast.success("Workspace deleted");
          router.push("/app");
          router.refresh();
        } else {
          toast.error("Failed to delete workspace.");
        }
      } finally {
        setIsDeletingWorkspace(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b-2 border-[#18181B]">
        <div className="inline-block px-2.5 py-0.5 rounded bg-[#FEF08A] border border-[#18181B] text-[11px] font-black text-[#18181B] mb-1">
          ORGANIZATION CONFIGURATION
        </div>
        <h1 className="text-3xl font-black text-[#18181B] tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#71717A] font-medium">
          Manage workspace profile, invite team members, and configure access permissions.
        </p>
      </div>

      {/* 1. General Profile */}
      <Card className="border-2 border-[#18181B] shadow-retro bg-white">
        <CardHeader className="border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#18181B]" />
            <CardTitle className="text-base font-black">Workspace Identity</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Basic information and brand styling for this workspace.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSaveGeneral}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Workspace Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canManage || isSavingGeneral}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">URL Slug (Immutable)</label>
              <Input value={workspace.slug} disabled className="bg-[#F5F2EB]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B]">Accent Color</label>
              <div className="flex items-center gap-2 h-10">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => canManage && setAccentColor(c)}
                    disabled={!canManage}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManage || isSavingGeneral}
                className="text-xs min-h-[60px]"
              />
            </div>
          </CardContent>

          {canManage && (
            <CardFooter className="flex justify-end p-6 pt-0">
              <Button
                type="submit"
                variant="primary"
                disabled={isSavingGeneral}
                className="font-bold"
              >
                {isSavingGeneral ? "Saving..." : "Save Workspace"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      {/* 2. Team Members & Roles */}
      <Card className="border-2 border-[#18181B] shadow-retro bg-white">
        <CardHeader className="border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#18181B]" />
            <CardTitle className="text-base font-black">Members & Role Permissions</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Manage teammate access across Owner, Admin, Member, and Viewer roles.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Invite Form */}
          {canManage && (
            <form
              onSubmit={handleInvite}
              className="p-4 rounded-xl border-2 border-[#18181B] bg-[#FDFBF7] shadow-retro-sm space-y-3"
            >
              <div className="text-xs font-black text-[#18181B] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#FF6B4A]" />
                <span>Invite New Teammate</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="text-xs flex-1"
                  required
                />

                <select
                  className="h-10 text-xs font-bold rounded-lg border-2 border-[#18181B] bg-white px-3"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                >
                  <option value="MEMBER">Member (Full Access)</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer (Read-Only)</option>
                </select>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="font-bold shrink-0 w-full sm:w-auto"
                >
                  {isInviting ? "Inviting..." : "Send Invite"}
                </Button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="divide-y divide-[#E4E4E7] border border-[#18181B] rounded-xl overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {member.image && <AvatarImage src={member.image} />}
                    <AvatarFallback className="text-[10px] font-black">
                      {member.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-black text-[#18181B] flex items-center gap-2">
                      <span>{member.name || "Unnamed"}</span>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#FEF08A] border border-[#18181B]">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#71717A]">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {canManage && member.role !== "OWNER" ? (
                    <select
                      className="text-xs font-bold rounded-lg border border-[#18181B] bg-[#F5F2EB] px-2 py-1"
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as WorkspaceRole)
                      }
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <Badge variant={member.role === "OWNER" ? "high" : "secondary"}>
                      {member.role}
                    </Badge>
                  )}

                  {canManage && member.role !== "OWNER" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="p-1.5 rounded text-[#71717A] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Danger Zone (Owner Only) */}
      {isOwner && (
        <Card className="border-2 border-[#EF4444] shadow-retro bg-[#FFF5F5]">
          <CardHeader className="border-b border-[#EF4444]/20">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-base font-black">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#DC2626]/80">
              Permanently delete this workspace and all projects, tasks, boards, and files.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#18181B]">Delete this workspace</div>
              <div className="text-[11px] text-[#71717A]">
                There is no recovery once deleted.
              </div>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteWorkspace}
              disabled={isDeletingWorkspace}
              className="font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {isDeletingWorkspace ? "Deleting..." : "Delete Workspace"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
