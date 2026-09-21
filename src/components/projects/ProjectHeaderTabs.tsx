"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Kanban, ListTodo, CalendarDays, BarChart3, Settings } from "lucide-react";

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

  const basePath = `/app/${workspaceSlug}/projects/${projectSlug}`;

  const tabs = [
    { name: "Kanban Board", href: `${basePath}/board`, icon: Kanban, key: "1" },
    { name: "List View", href: `${basePath}/list`, icon: ListTodo, key: "2" },
    { name: "Calendar", href: `${basePath}/calendar`, icon: CalendarDays, key: "3" },
    { name: "Analytics", href: `${basePath}/analytics`, icon: BarChart3, key: "4" },
    { name: "Settings", href: `${basePath}/settings`, icon: Settings },
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
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              isActive
                ? "bg-[#18181B] text-white shadow-retro-sm"
                : "text-[#71717A] hover:bg-[#F5F2EB] hover:text-[#18181B]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF6B4A]" : "text-[#71717A]"}`} />
            <span>{tab.name}</span>
            {tab.key && (
              <span
                className={`text-[9px] px-1 rounded border font-mono ${
                  isActive
                    ? "border-white/40 text-white/80"
                    : "border-[#18181B]/20 text-[#A1A1AA]"
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
