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
import { useTranslation } from "@/lib/i18n/context";

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
  members: initialMembers,
  currentRole,
  currentUserId,
}: WorkspaceSettingsClientViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [members, setMembers] = useState(initialMembers);

  // General profile state
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || "");
  const [accentColor, setAccentColor] = useState(workspace.accentColor);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  // Danger zone state
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const isOwner = currentRole === "OWNER";
  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSavingGeneral(true);
    try {
      await updateWorkspaceAction({
        workspaceId: workspace.id,
        name: name.trim(),
        description: description.trim() || undefined,
        accentColor,
      });

      toast.success("Workspace profile updated");
      router.refresh();
    } catch {
      toast.error("Failed to update workspace");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const res = await inviteMemberAction({
        workspaceId: workspace.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to invite teammate");
      }
    } catch {
      toast.error("Failed to invite teammate");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    try {
      const res = await updateMemberRoleAction({
        workspaceId: workspace.id,
        memberId,
        role,
      });

      if (res.success) {
        toast.success("Member role updated");
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role } : m))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string | null) => {
    if (confirm(`Remove ${memberName || "this member"} from the workspace?`)) {
      try {
        await removeMemberAction(workspace.id, memberId);
        toast.success("Member removed from workspace");
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        router.refresh();
      } catch {
        toast.error("Failed to remove member");
      }
    }
  };

  const handleDeleteWorkspace = async () => {
    if (
      confirm(
        `Are you absolutely sure you want to delete "${workspace.name}"? This action CANNOT be undone.`
      )
    ) {
      setIsDeletingWorkspace(true);
      try {
        await deleteWorkspaceAction(workspace.id);
        toast.success("Workspace deleted");
        router.push("/app");
        router.refresh();
      } catch {
        toast.error("Failed to delete workspace");
        setIsDeletingWorkspace(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b-2 border-[#18181B] dark:border-[#3F3F4A]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E0D8FF] dark:bg-[#2D2350] border border-[#18181B] dark:border-[#3F3F4A] text-[10px] font-black text-[#18181B] dark:text-[#C4B5FD]">
          <Shield className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#A78BFA]" />
          <span>{currentRole} ACCESS</span>
        </div>
        <h1 className="text-3xl font-black text-[#18181B] dark:text-[#F4F4F5] tracking-tight">
          {t.workspaces.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-medium">
          Manage workspace profile, invite team members, and configure access permissions.
        </p>
      </div>

      {/* 1. General Profile */}
      <Card className="border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro bg-white dark:bg-[#18181D]">
        <CardHeader className="border-b border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#18181B] dark:text-[#F4F4F5]" />
            <CardTitle className="text-base font-black text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.generalTab}</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Basic information and brand styling for this workspace.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSaveGeneral}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.workspaceName}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canManage || isSavingGeneral}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.workspaceSlug} (Immutable)</label>
              <Input value={workspace.slug} disabled className="bg-[#F5F2EB] dark:bg-[#202029]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.projects.accentColor}</label>
              <div className="flex items-center gap-2 h-10">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => canManage && setAccentColor(c)}
                    disabled={!canManage}
                    className={`w-6 h-6 rounded-full border-2 border-[#18181B] dark:border-[#3F3F4A] transition-transform ${
                      accentColor === c ? "scale-125 shadow-retro-sm" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.workspaceDescription}</label>
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
                {isSavingGeneral ? t.common.loading : t.common.save}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      {/* 2. Team Members & Roles */}
      <Card className="border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro bg-white dark:bg-[#18181D]">
        <CardHeader className="border-b border-[#E4E4E7] dark:border-[#2E2E38]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#18181B] dark:text-[#F4F4F5]" />
            <CardTitle className="text-base font-black text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.membersTab}</CardTitle>
          </div>
          <CardDescription className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Manage teammate access across Owner, Admin, Member, and Viewer roles.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Invite Form */}
          {canManage && (
            <form
              onSubmit={handleInvite}
              className="p-4 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#15151A] shadow-retro-sm space-y-3"
            >
              <div className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#FF6B4A]" />
                <span>{t.workspaces.inviteMember}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="email"
                  placeholder={t.workspaces.memberEmail}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="text-xs flex-1"
                  required
                />

                <select
                  className="h-10 text-xs font-bold rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5] px-3"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                >
                  <option value="MEMBER">{t.roles.MEMBER}</option>
                  <option value="ADMIN">{t.roles.ADMIN}</option>
                  <option value="VIEWER">{t.roles.VIEWER}</option>
                </select>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="font-bold shrink-0 w-full sm:w-auto"
                >
                  {isInviting ? t.common.loading : t.workspaces.inviteMember}
                </Button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E38] border border-[#18181B] dark:border-[#3F3F4A] rounded-xl overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 bg-white dark:bg-[#18181D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-[#18181B] dark:border-[#3F3F4A]">
                    {member.image && <AvatarImage src={member.image} />}
                    <AvatarFallback className="text-[10px] font-black bg-[#FF6B4A] text-white">
                      {member.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-black text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                      <span>{member.name || "Unnamed"}</span>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FACC15] border border-[#18181B] dark:border-[#FACC15]">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {canManage && member.role !== "OWNER" ? (
                    <select
                      className="text-xs font-bold rounded-lg border border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#202029] text-[#18181B] dark:text-[#F4F4F5] px-2 py-1"
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as WorkspaceRole)
                      }
                    >
                      <option value="ADMIN">{t.roles.ADMIN}</option>
                      <option value="MEMBER">{t.roles.MEMBER}</option>
                      <option value="VIEWER">{t.roles.VIEWER}</option>
                    </select>
                  ) : (
                    <Badge variant={member.role === "OWNER" ? "high" : "secondary"}>
                      {t.roles[member.role] || member.role}
                    </Badge>
                  )}

                  {canManage && member.role !== "OWNER" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="p-1.5 rounded text-[#71717A] dark:text-[#A1A1AA] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1414] transition-colors"
                      title={t.workspaces.removeMember}
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
        <Card className="border-2 border-[#EF4444] shadow-retro bg-[#FFF5F5] dark:bg-[#2A1414]">
          <CardHeader className="border-b border-[#EF4444]/20">
            <div className="flex items-center gap-2 text-[#DC2626] dark:text-[#F87171]">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-base font-black">{t.workspaces.dangerZone}</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#DC2626]/80 dark:text-[#F87171]/80">
              Permanently delete this workspace and all projects, tasks, boards, and files.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{t.workspaces.deleteWorkspace}</div>
              <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
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
              {isDeletingWorkspace ? t.common.loading : t.workspaces.deleteWorkspace}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
