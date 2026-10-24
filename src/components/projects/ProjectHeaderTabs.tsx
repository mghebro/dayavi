"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Kanban, ListTodo, CalendarDays, BarChart3, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface ProjectHeaderTabsProps {
  workspaceSlug: string;
  projectSlug: string;
}

export function ProjectHeaderTabs({
  workspaceSlug,
  projectSlug,
}: ProjectHeaderTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const basePath = `/app/${workspaceSlug}/projects/${projectSlug}`;

  const tabs = [
    { name: t.projects.tabs.board, href: `${basePath}/board`, icon: Kanban, key: "1" },
    { name: t.projects.tabs.list, href: `${basePath}/list`, icon: ListTodo, key: "2" },
    { name: t.projects.tabs.calendar, href: `${basePath}/calendar`, icon: CalendarDays, key: "3" },
    { name: t.projects.tabs.analytics, href: `${basePath}/analytics`, icon: BarChart3, key: "4" },
    { name: t.projects.tabs.settings, href: `${basePath}/settings`, icon: Settings },
  ];

  // Number key navigation (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "1") router.push(`${basePath}/board`);
      if (e.key === "2") router.push(`${basePath}/list`);
      if (e.key === "3") router.push(`${basePath}/calendar`);
      if (e.key === "4") router.push(`${basePath}/analytics`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [basePath, router]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              isActive
                ? "bg-[#18181B] dark:bg-[#FF6B4A] text-white dark:text-[#18181B] shadow-retro-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F5F2EB] dark:hover:bg-[#202029] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF6B4A] dark:text-[#18181B]" : "text-[#71717A] dark:text-[#A1A1AA]"}`} />
            <span>{tab.name}</span>
            {tab.key && (
              <span
                className={`text-[9px] px-1 rounded border font-mono ${
                  isActive
                    ? "border-white/40 dark:border-black/30 text-white/80 dark:text-black/80"
                    : "border-[#18181B]/20 dark:border-[#52525B] text-[#A1A1AA]"
                }`}
              >
                {tab.key}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
