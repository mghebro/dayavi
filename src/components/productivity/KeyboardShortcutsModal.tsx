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

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

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
      group: "Navigation & Search",
      items: [
        { keys: ["⌘", "K"], desc: "Open Command Palette / Search" },
        { keys: ["?"], desc: "Open Keyboard Shortcuts reference" },
        { keys: ["Esc"], desc: "Close open dialog or drawer" },
      ],
    },
    {
      group: "Task & Project Creation",
      items: [
        { keys: ["C"], desc: "Create a new Task" },
        { keys: ["P"], desc: "Create a new Project" },
      ],
    },
    {
      group: "Views & Switching",
      items: [
        { keys: ["1"], desc: "Switch to Kanban Board view" },
        { keys: ["2"], desc: "Switch to List view" },
        { keys: ["3"], desc: "Switch to Calendar view" },
        { keys: ["4"], desc: "Switch to Analytics view" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEF08A] border-2 border-[#18181B] flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-[#18181B]" />
            </div>
            <div>
              <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Accelerate your workflow with productivity shortcuts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {shortcutGroups.map((grp) => (
            <div key={grp.group} className="space-y-1.5">
              <div className="text-[11px] font-black text-[#71717A] uppercase tracking-wider">
                {grp.group}
              </div>
              <div className="space-y-1">
                {grp.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#FDFBF7] border border-[#E4E4E7] text-xs font-semibold text-[#18181B]"
                  >
                    <span>{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="min-w-5 px-1.5 py-0.5 rounded bg-white border border-[#18181B] shadow-retro-sm text-center text-[10px] font-black text-[#18181B]"
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
