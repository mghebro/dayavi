"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  LayoutDashboard,
  CheckSquare,
  Bell,
  Settings,
  FolderPlus,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import { globalSearchAction, SearchResults } from "@/server/actions/search";

interface CommandPaletteProps {
  workspaceSlug: string;
  workspaceId: string;
  onOpenQuickTask?: () => void;
  onOpenQuickProject?: () => void;
}

export function CommandPalette({
  workspaceSlug,
  workspaceId,
  onOpenQuickTask,
  onOpenQuickProject,
}: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Toggle on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await globalSearchAction(query, workspaceId);
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, workspaceId]);

  const navigate = useCallback(
    (path: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(path);
    },
    [router]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#18181B]/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in-0">
      <div className="w-full max-w-xl rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b-2 border-[#18181B] bg-[#FDFBF7]">
          <Search className="w-5 h-5 text-[#71717A] mr-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-sm font-semibold text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none"
            placeholder="Type a command or search tasks, projects, boards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#71717A] hover:text-[#18181B] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-[#F5F2EB] border border-[#18181B] text-[10px] font-bold text-[#71717A]">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Body */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Live Search Results */}
          {query.trim() && searchResults && (
            <div className="space-y-3">
              {searchResults.tasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-2 mb-1">
                    Tasks
                  </div>
                  <div className="space-y-1">
                    {searchResults.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() =>
                          navigate(`/app/${workspaceSlug}/projects/${task.projectSlug}/board?taskId=${task.id}`)
                        }
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                      >
                        <span className="truncate">{task.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E0D8FF] border border-[#18181B]">
                          {task.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-2 mb-1">
                    Projects
                  </div>
                  <div className="space-y-1">
                    {searchResults.projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => navigate(`/app/${workspaceSlug}/projects/${proj.slug}/board`)}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#18181B]"
                            style={{ backgroundColor: proj.accentColor }}
                          />
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-[#71717A]">{proj.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isSearching &&
                searchResults.tasks.length === 0 &&
                searchResults.projects.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#71717A] font-medium">
                    No results found for &ldquo;{query}&rdquo;.
                  </div>
                )}
            </div>
          )}

          {/* Quick Actions & Navigation when not searching */}
          {!query.trim() && (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-[#71717A] uppercase tracking-wider px-2 mb-1.5">
                  Quick Actions
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenQuickTask?.();
                    }}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#FEF08A] border border-transparent hover:border-[#18181B] transition-all text-xs font-bold text-[#18181B]"
                  >
                    <div className="w-6 h-6 rounded bg-[#FF6B4A] border border-[#18181B] flex items-center justify-center text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Create New Task</span>
                    <kbd className="ml-auto text-[10px] font-bold text-[#71717A]">C</kbd>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenQuickProject?.();
                    }}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#E0D8FF] border border-transparent hover:border-[#18181B] transition-all text-xs font-bold text-[#18181B]"
                  >
                    <div className="w-6 h-6 rounded bg-[#E0D8FF] border border-[#18181B] flex items-center justify-center text-[#18181B]">
                      <FolderPlus className="w-3.5 h-3.5" />
                    </div>
                    <span>Create New Project</span>
                    <kbd className="ml-auto text-[10px] font-bold text-[#71717A]">P</kbd>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#71717A] uppercase tracking-wider px-2 mb-1.5">
                  Navigation
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/dashboard`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#71717A]" />
                    <span>Workspace Dashboard</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/my-tasks`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                  >
                    <CheckSquare className="w-4 h-4 text-[#71717A]" />
                    <span>My Tasks Triage</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/notifications`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                  >
                    <Bell className="w-4 h-4 text-[#71717A]" />
                    <span>Notification Center</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/settings`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] border border-transparent hover:border-[#18181B] transition-all text-xs font-semibold text-[#18181B]"
                  >
                    <Settings className="w-4 h-4 text-[#71717A]" />
                    <span>Workspace Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#E4E4E7] bg-[#FDFBF7] flex items-center justify-between text-[11px] text-[#71717A] font-medium">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#18181B] text-[9px] font-bold">↑↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#18181B] text-[9px] font-bold">↵</kbd>
          </div>
          <div>Dayavi Command Palette</div>
        </div>
      </div>
    </div>
  );
}
