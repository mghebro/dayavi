"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "icon" | "full";
}

export function LanguageSwitcher({ className = "", variant = "pill" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === "ka" ? "en" : "ka");
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggleLanguage}
        className={`p-1.5 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F46] bg-white dark:bg-[#1C1C21] shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center font-bold text-xs ${className}`}
        title={t.lang.switchLanguage}
        aria-label={t.lang.switchLanguage}
      >
        <span className="text-xs uppercase">{locale === "ka" ? "GE" : "EN"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F46] bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#F4F4F5] shadow-retro-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all text-xs font-black ${className}`}
      title={t.lang.switchLanguage}
      aria-label={t.lang.switchLanguage}
    >
      <Globe className="w-3.5 h-3.5 text-[#FF6B4A]" />
      <span className="tracking-wide">
        {locale === "ka" ? "ქართული" : "English"}
      </span>
      <span className="text-[10px] px-1 py-0.2 rounded bg-[#F5F2EB] dark:bg-[#27272A] border border-[#18181B] dark:border-[#52525B] font-mono text-[#71717A] dark:text-[#A1A1AA]">
        {locale === "ka" ? "GE" : "EN"}
      </span>
    </button>
  );
}
