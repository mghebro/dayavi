"use client";

import React from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill";
}

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = resolvedTheme === "dark";

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F46] bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#F4F4F5] shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all text-xs font-black ${className}`}
        title={t.theme.toggleTheme}
        aria-label={t.theme.toggleTheme}
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-[#FACC15] animate-spin-slow" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-[#8B5CF6]" />
        )}
        <span>{isDark ? t.theme.light : t.theme.dark}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F46] bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#F4F4F5] shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Neo Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FACC15]" />
      ) : (
        <Moon className="w-4 h-4 text-[#8B5CF6]" />
      )}
    </button>
  );
}
