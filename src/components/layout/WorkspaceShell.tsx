"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Bell,
  Settings,
  Plus,
  Search,
  Keyboard,
  ChevronDown,
  LogOut,
  Building2,
  FolderPlus,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/productivity/CommandPalette";
import { KeyboardShortcutsModal } from "@/components/productivity/KeyboardShortcutsModal";
import { QuickCreateTaskModal } from "@/components/tasks/QuickCreateTaskModal";
import { QuickCreateProjectModal } from "@/components/projects/QuickCreateProjectModal";
import { QuickCreateWorkspaceModal } from "@/components/workspaces/QuickCreateWorkspaceModal";
import { logoutUser } from "@/server/actions/auth";

interface WorkspaceShellProps {
  currentWorkspace: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
  };
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    accentColor: string;
    role: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    accentColor: string;
    status: string;
    boards: Array<{
      id: string;
      columns: Array<{ id: string; name: string }>;
    }>;
  }>;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  unreadNotificationsCount: number;
  children: React.ReactNode;
}

export function WorkspaceShell({
  currentWorkspace,
  workspaces,
  projects,
  user,
  unreadNotificationsCount,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navLinks = [
    {
      name: "Dashboard",
      href: `/app/${currentWorkspace.slug}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "My Tasks",
      href: `/app/${currentWorkspace.slug}/my-tasks`,
      icon: CheckSquare,
    },
    {
      name: "Projects",
      href: `/app/${currentWorkspace.slug}/projects`,
      icon: FolderKanban,
    },
    {
      name: "Notifications",
      href: `/app/${currentWorkspace.slug}/notifications`,
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
  ];

  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* ----------------------------------------------------
       * DESKTOP & MOBILE SIDEBAR
       * ---------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F5F2EB] border-r-2 border-[#18181B] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0 shadow-retro-lg" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Workspace Switcher */}
          <div className="p-4 border-b-2 border-[#18181B] bg-[#FDFBF7]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#18181B] shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-left">
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-7 h-7 rounded-lg border-2 border-[#18181B] flex items-center justify-center text-white font-black text-xs shadow-retro-sm shrink-0"
                      style={{ backgroundColor: currentWorkspace.accentColor }}
                    >
                      {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-black text-[#18181B] truncate">
                      {currentWorkspace.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#71717A] shrink-0" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 p-1.5" align="start">
                <div className="text-[10px] font-black text-[#71717A] uppercase tracking-wider px-2 py-1">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      router.push(`/app/${ws.slug}/dashboard`);
                      router.refresh();
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-[#18181B]"
                        style={{ backgroundColor: ws.accentColor }}
                      />
                      <span className="font-bold text-xs truncate">{ws.name}</span>
                    </div>
                    {ws.id === currentWorkspace.id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FEF08A] border border-[#18181B]">
                        Active
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className="flex items-center gap-2 text-[#FF6B4A] font-bold cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Create Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Core Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-[#18181B] border-2 border-[#18181B] shadow-retro-sm"
                      : "text-[#52525B] hover:bg-[#EAE4D9] hover:text-[#18181B]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B4A]" : "text-[#71717A]"}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#FF6B4A] border border-[#18181B] text-white text-[10px] font-black">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Projects Sidebar Section */}
          <div className="p-3 pt-2">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-[11px] font-black text-[#71717A] uppercase tracking-wider">
                Projects
              </span>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="w-5 h-5 rounded border border-[#18181B] bg-white hover:bg-[#FEF08A] flex items-center justify-center text-[#18181B] transition-colors"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-[#A1A1AA] italic">
                  No projects yet
                </div>
              ) : (
                projects.map((proj) => {
                  const isProjectActive = pathname.includes(`/projects/${proj.slug}`);
                  return (
                    <Link
                      key={proj.id}
                      href={`/app/${currentWorkspace.slug}/projects/${proj.slug}/board`}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isProjectActive
                          ? "bg-white text-[#18181B] border border-[#18181B] shadow-retro-sm font-bold"
                          : "text-[#52525B] hover:bg-[#EAE4D9] hover:text-[#18181B]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-[#18181B] shrink-0"
                          style={{ backgroundColor: proj.accentColor }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t-2 border-[#18181B] bg-[#FDFBF7] space-y-2">
          <Link
            href={`/app/${currentWorkspace.slug}/settings`}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname.endsWith("/settings")
                ? "bg-white text-[#18181B] border border-[#18181B] shadow-retro-sm"
                : "text-[#71717A] hover:bg-[#EAE4D9] hover:text-[#18181B]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Workspace Settings</span>
          </Link>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E7]">
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-7 w-7">
                {user.image ? <AvatarImage src={user.image} /> : null}
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-[#18181B] truncate">
                  {user.name || "Teammate"}
                </span>
                <span className="text-[10px] text-[#71717A] truncate">
                  {user.email || ""}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-[#71717A] hover:text-[#DC2626] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#18181B]/40 lg:hidden"
        />
      )}

      {/* ----------------------------------------------------
       * MAIN CONTENT AREA WITH TOPBAR
       * ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-20 h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-b-2 border-[#18181B] px-4 sm:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border-2 border-[#18181B] bg-white lg:hidden shadow-retro-sm"
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              href={`/app/${currentWorkspace.slug}/dashboard`}
              className="flex items-center gap-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              <span className="font-black text-[#18181B]">Dayavi</span>
              <span>/</span>
              <span className="truncate max-w-[140px] sm:max-w-none text-[#18181B]">
                {currentWorkspace.name}
              </span>
            </Link>
          </div>

          {/* Right: Quick actions, Search trigger, New Task */}
          <div className="flex items-center gap-2.5">
            {/* Cmd+K Search trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-[#18181B] shadow-retro-sm text-xs font-semibold text-[#71717A] hover:bg-[#F5F2EB] transition-all"
            >
              <Search className="w-3.5 h-3.5 text-[#18181B]" />
              <span>Search...</span>
              <kbd className="ml-2 px-1.5 py-0.2 rounded bg-[#F5F2EB] border border-[#18181B] text-[10px] font-black text-[#18181B]">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Task button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
              className="font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 min-w-0">{children}</main>
      </div>

      {/* Global Modals & Helpers */}
      <CommandPalette
        workspaceSlug={currentWorkspace.slug}
        workspaceId={currentWorkspace.id}
        onOpenQuickTask={() => setIsTaskModalOpen(true)}
        onOpenQuickProject={() => setIsProjectModalOpen(true)}
      />
      <KeyboardShortcutsModal />
      <QuickCreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
      />
      <QuickCreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        workspaceId={currentWorkspace.id}
        workspaceSlug={currentWorkspace.slug}
      />
      <QuickCreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
    </div>
  );
}
