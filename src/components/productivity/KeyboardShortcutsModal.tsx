"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input or textarea, don't trigger shortcut
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcutGroups = [
    {
      group: t.shortcuts.globalCategory,
      items: [
        { keys: ["⌘", "K"], desc: t.shortcuts.actionSearch },
        { keys: ["?"], desc: t.shortcuts.actionShortcuts },
        { keys: ["Esc"], desc: t.shortcuts.actionClose },
      ],
    },
    {
      group: t.commandPalette.actions,
      items: [
        { keys: ["C"], desc: t.shortcuts.actionNewTask },
        { keys: ["P"], desc: t.commandPalette.createProject },
      ],
    },
    {
      group: t.shortcuts.navigationCategory,
      items: [
        { keys: ["1"], desc: t.projects.tabs.board },
        { keys: ["2"], desc: t.projects.tabs.list },
        { keys: ["3"], desc: t.projects.tabs.calendar },
        { keys: ["4"], desc: t.projects.tabs.analytics },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEF08A] dark:bg-[#3D3512] border-2 border-[#18181B] dark:border-[#FACC15] flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-[#18181B] dark:text-[#FACC15]" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.shortcuts.title}</DialogTitle>
              <DialogDescription>
                {t.shortcuts.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {shortcutGroups.map((grp) => (
            <div key={grp.group} className="space-y-1.5">
              <div className="text-[11px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                {grp.group}
              </div>
              <div className="space-y-1">
                {grp.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] dark:bg-[#15151A] border border-[#E4E4E7] dark:border-[#2E2E38] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <span>{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="min-w-5 px-1.5 py-0.5 rounded bg-white dark:bg-[#202029] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm text-center text-[10px] font-black text-[#18181B] dark:text-[#F4F4F5]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
