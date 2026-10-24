"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailDrawer, TaskDetailData } from "@/components/tasks/TaskDetailDrawer";
import { TaskPriority } from "@prisma/client";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t, locale } = useTranslation();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesKa = [
    "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
    "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
  ];
  const monthNames = locale === "ka" ? monthNamesKa : monthNamesEn;

  const daysOfWeekEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysOfWeekKa = ["კვი", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
  const daysOfWeek = locale === "ka" ? daysOfWeekKa : daysOfWeekEn;

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
  for (const tItem of tasks) {
    if (tItem.dueDate) {
      const d = new Date(tItem.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
        tasksByDay[dayNum].push(tItem);
      }
    }
  }

  // Grid cells
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEF08A] dark:bg-[#3D3512] border-2 border-[#18181B] dark:border-[#FACC15] flex items-center justify-center font-black text-sm">
            <CalendarIcon className="w-4 h-4 text-[#18181B] dark:text-[#FACC15]" />
          </div>
          <h2 className="text-xl font-black text-[#18181B] dark:text-[#F4F4F5]">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="font-bold">
            {t.views.calendar.today}
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
      <div className="rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#15151A] text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-2.5 text-[11px] font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider border-r border-[#E4E4E7] dark:border-[#2E2E38] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-y divide-x divide-[#E4E4E7] dark:divide-[#2E2E38]">
          {calendarCells.map((day, idx) => {
            if (day == null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[100px] sm:min-h-[120px] bg-[#F5F2EB]/50 dark:bg-[#121217]/50 p-2"
                />
              );
            }

            const dayTasks = tasksByDay[day] || [];
            const today = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors ${
                  today ? "bg-[#FEF08A]/15 dark:bg-[#3D3512]/30" : "hover:bg-[#FDFBF7] dark:hover:bg-[#1D1D26]"
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      today
                        ? "bg-[#18181B] dark:bg-[#FF6B4A] text-white dark:text-[#18181B]"
                        : "text-[#71717A] dark:text-[#A1A1AA]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-extrabold text-[#71717A] dark:text-[#A1A1AA]">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {dayTasks.map((tItem) => (
                    <button
                      key={tItem.id}
                      onClick={() => handleOpenDetail(tItem.id)}
                      className="w-full text-left p-1.5 rounded-md border border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#202029] hover:bg-[#F5F2EB] dark:hover:bg-[#2A2A38] shadow-retro-sm text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5] truncate block transition-all"
                    >
                      <span className="truncate block">{tItem.title}</span>
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
