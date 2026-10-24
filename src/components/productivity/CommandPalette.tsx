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
  X,
} from "lucide-react";
import { globalSearchAction, SearchResults } from "@/server/actions/search";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();
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
    <div className="fixed inset-0 z-50 bg-[#18181B]/50 dark:bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in-0">
      <div className="w-full max-w-xl rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#121216]">
          <Search className="w-5 h-5 text-[#71717A] dark:text-[#A1A1AA] mr-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#71717A] focus:outline-none"
            placeholder={t.commandPalette.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-[#F5F2EB] dark:bg-[#202029] border border-[#18181B] dark:border-[#3F3F4A] text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA]">
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
                  <div className="text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider px-2 mb-1">
                    {t.commandPalette.tasks}
                  </div>
                  <div className="space-y-1">
                    {searchResults.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() =>
                          navigate(`/app/${workspaceSlug}/projects/${task.projectSlug}/board?taskId=${task.id}`)
                        }
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                      >
                        <span className="truncate">{task.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E0D8FF] dark:bg-[#2D2350] border border-[#18181B] dark:border-[#3F3F4A] text-[#18181B] dark:text-[#C4B5FD]">
                          {task.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider px-2 mb-1">
                    {t.commandPalette.projects}
                  </div>
                  <div className="space-y-1">
                    {searchResults.projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => navigate(`/app/${workspaceSlug}/projects/${proj.slug}/board`)}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#18181B] dark:border-[#3F3F4A]"
                            style={{ backgroundColor: proj.accentColor }}
                          />
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">{proj.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isSearching &&
                searchResults.tasks.length === 0 &&
                searchResults.projects.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#71717A] dark:text-[#A1A1AA] font-medium">
                    {t.commandPalette.noResults}
                  </div>
                )}
            </div>
          )}

          {/* Quick Actions & Navigation when not searching */}
          {!query.trim() && (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider px-2 mb-1.5">
                  {t.commandPalette.actions}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenQuickTask?.();
                    }}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#FEF08A] dark:hover:bg-[#3D3512] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <div className="w-6 h-6 rounded bg-[#FF6B4A] border border-[#18181B] flex items-center justify-center text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.commandPalette.createTask}</span>
                    <kbd className="ml-auto text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA]">C</kbd>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenQuickProject?.();
                    }}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#E0D8FF] dark:hover:bg-[#2D2350] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <div className="w-6 h-6 rounded bg-[#E0D8FF] dark:bg-[#2D2350] border border-[#18181B] flex items-center justify-center text-[#18181B] dark:text-[#C4B5FD]">
                      <FolderPlus className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.commandPalette.createProject}</span>
                    <kbd className="ml-auto text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA]">P</kbd>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider px-2 mb-1.5">
                  {t.commandPalette.navigation}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/dashboard`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
                    <span>{t.nav.dashboard}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/my-tasks`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <CheckSquare className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
                    <span>{t.nav.myTasks}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/notifications`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <Bell className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
                    <span>{t.nav.notifications}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/app/${workspaceSlug}/settings`)}
                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#202029] border border-transparent hover:border-[#18181B] dark:hover:border-[#3F3F4A] transition-all text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <Settings className="w-4 h-4 text-[#71717A] dark:text-[#A1A1AA]" />
                    <span>{t.workspaces.settingsTitle}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#E4E4E7] dark:border-[#2E2E38] bg-[#FDFBF7] dark:bg-[#121216] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-medium">
          <div className="flex items-center gap-2">
            <span>{t.commandPalette.navigation}:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#202029] border border-[#18181B] dark:border-[#3F3F4A] text-[9px] font-bold">↑↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#202029] border border-[#18181B] dark:border-[#3F3F4A] text-[9px] font-bold">↵</kbd>
          </div>
          <div>Dayavi ({t.brand.name})</div>
        </div>
      </div>
    </div>
  );
}
