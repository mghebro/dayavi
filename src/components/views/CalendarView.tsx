"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { formatDate } from "@/lib/utils";
import { TaskPriority } from "@prisma/client";

export interface CalendarTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: string;
  dueDate?: Date | string | null;
  startDate?: Date | string | null;
  column: { name: string };
}

interface CalendarViewProps {
  tasks: CalendarTask[];
  currentUserId: string;
  activeTaskDetail?: TaskDetailData | null;
}

export function CalendarView({
  tasks,
  currentUserId,
  activeTaskDetail,
}: CalendarViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenDetail = (taskId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("taskId", taskId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("taskId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Map tasks to dates
  const tasksByDay: Record<number, CalendarTask[]> = {};
  for (const t of tasks) {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
        tasksByDay[dayNum].push(t);
      }
    }
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Grid cells
  const calendarCells = [];
  // Empty cells for padding before day 1
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const isToday = (d: number) => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === d;
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEF08A] border-2 border-[#18181B] flex items-center justify-center font-black text-sm">
            <CalendarIcon className="w-4 h-4 text-[#18181B]" />
          </div>
          <h2 className="text-xl font-black text-[#18181B]">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="font-bold">
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={prevMonth} title="Previous Month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={nextMonth} title="Next Month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border-2 border-[#18181B] bg-white shadow-retro overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-[#18181B] bg-[#FDFBF7] text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-2.5 text-[11px] font-black text-[#71717A] uppercase tracking-wider border-r border-[#E4E4E7] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-y divide-x divide-[#E4E4E7]">
          {calendarCells.map((day, idx) => {
            if (day == null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[100px] sm:min-h-[120px] bg-[#F5F2EB]/50 p-2"
                />
              );
            }

            const dayTasks = tasksByDay[day] || [];
            const today = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors ${
                  today ? "bg-[#FEF08A]/15" : "hover:bg-[#FDFBF7]"
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      today
                        ? "bg-[#18181B] text-white"
                        : "text-[#71717A]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-extrabold text-[#71717A]">
                      {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {dayTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleOpenDetail(t.id)}
                      className="w-full text-left p-1.5 rounded-md border border-[#18181B] bg-white hover:bg-[#F5F2EB] shadow-retro-sm text-[11px] font-bold text-[#18181B] truncate block transition-all"
                    >
                      <span className="truncate block">{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Slide-Over Drawer */}
      <TaskDetailDrawer
        task={activeTaskDetail || null}
        isOpen={!!searchParams.get("taskId") && !!activeTaskDetail}
        onClose={handleCloseDetail}
        currentUserId={currentUserId}
      />
    </div>
  );
}
