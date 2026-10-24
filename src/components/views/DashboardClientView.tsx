"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity as ActivityIcon,
  Flame,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface DashboardClientViewProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  userName: string;
  totalTasksCount: number;
  completedTasksCount: number;
  completionRate: number;
  dueTodayTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | string | null;
    project: { slug: string; name: string };
  }>;
  urgentTasks: Array<{
    id: string;
    title: string;
    project: { slug: string; name: string };
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | string | null;
    project: { slug: string; name: string };
  }>;
  myAssignedTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | string | null;
    project: { slug: string; name: string };
  }>;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    accentColor: string;
    description: string | null;
    _count: { tasks: number };
    tasks: Array<{ id: string }>;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    createdAt: Date | string;
    actor: { name: string | null };
    task: { title: string } | null;
    project: { name: string } | null;
  }>;
}

export function DashboardClientView({
  workspace,
  userName,
  totalTasksCount,
  completedTasksCount,
  completionRate,
  dueTodayTasks,
  urgentTasks,
  overdueTasks,
  myAssignedTasks,
  projects,
  recentActivities,
}: DashboardClientViewProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ----------------------------------------------------
       * EDITORIAL GREETING & FOCUS BANNER
       * ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b-2 border-[#18181B] dark:border-[#3F3F4A]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FEF08A] dark:bg-[#3D3512] border border-[#18181B] dark:border-[#FACC15] text-[11px] font-black text-[#18181B] dark:text-[#FDE047]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>DAILY RADAR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
            {locale === "ka"
              ? `გამარჯობა, ${userName}. მოდი დავიწყოთ.`
              : `Good day, ${userName}. Let's get things moving.`}
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-medium">
            {locale === "ka" ? (
              <>
                აქ არის <strong>{workspace.name}</strong>-ის მიმდინარე სიტუაციური მიმოხილვა.
              </>
            ) : (
              <>
                Here is your live situational overview for <strong>{workspace.name}</strong>.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm" className="font-bold">
            <Link href={`/app/${workspace.slug}/my-tasks`}>{t.nav.myTasks}</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="font-bold">
            <Link href={`/app/${workspace.slug}/projects`}>{t.projects.allProjects}</Link>
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------
       * TOP METRICS GRID (ASYMMETRIC EDITORIAL TILES)
       * ---------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>{t.views.analytics.totalTasks}</span>
            <Layers className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#18181B] dark:text-[#F4F4F5]">{totalTasksCount}</div>
            <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              {locale === "ka" ? "ყველა აქტიურ პროექტში" : "Across all active projects"}
            </div>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#D1FAE5] dark:bg-[#143528] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#166534] dark:text-[#6EE7B7] uppercase tracking-wider">
            <span>{t.views.analytics.completionRate}</span>
            <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#6EE7B7]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#166534] dark:text-[#6EE7B7]">{completionRate}%</div>
            <div className="text-[11px] text-[#166534]/80 dark:text-[#6EE7B7]/80 mt-0.5">
              {completedTasksCount} {locale === "ka" ? "შესრულებული ტასკი" : "completed tasks"}
            </div>
          </div>
        </div>

        {/* Metric 3: Due Today */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FEF08A] dark:bg-[#3D3512] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#854D0E] dark:text-[#FDE047] uppercase tracking-wider">
            <span>{t.views.myTasks.today}</span>
            <Clock className="w-4 h-4 text-[#854D0E] dark:text-[#FDE047]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#854D0E] dark:text-[#FDE047]">{dueTodayTasks.length}</div>
            <div className="text-[11px] text-[#854D0E]/80 dark:text-[#FDE047]/80 mt-0.5">
              {urgentTasks.length} {t.priorities.URGENT.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Metric 4: Overdue Attention */}
        <div className="p-5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FEE2E2] dark:bg-[#3D1414] shadow-retro flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black text-[#DC2626] dark:text-[#F87171] uppercase tracking-wider">
            <span>{t.views.myTasks.overdue}</span>
            <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-[#F87171]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#DC2626] dark:text-[#F87171]">{overdueTasks.length}</div>
            <div className="text-[11px] text-[#DC2626]/80 dark:text-[#F87171]/80 mt-0.5">
              {locale === "ka" ? "მოითხოვს დაუყოვნებლივ ყურადღებას" : "Requires immediate attention"}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
       * ASYMMETRIC MAIN SECTION: TODAY'S FOCUS & MY WORK
       * ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: TODAY'S FOCUS & PROJECTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Focus Card */}
          <Card className="border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro-md bg-white dark:bg-[#18181D]">
            <CardHeader className="pb-3 border-b border-[#E4E4E7] dark:border-[#2E2E38] flex flex-row items-center justify-between">
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] border border-[#18181B] dark:border-[#FACC15] text-[10px] font-bold mb-1">
                  ATTENTION NEEDED
                </div>
                <CardTitle className="text-xl font-black text-[#18181B] dark:text-[#F4F4F5]">
                  {locale === "ka" ? "დღევანდელი ფოკუსი და სასწრაფო საქმეები" : "Today's Focus & Urgent Work"}
                </CardTitle>
              </div>
              <Flame className="w-5 h-5 text-[#FF6B4A]" />
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {overdueTasks.length === 0 && dueTodayTasks.length === 0 && urgentTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FDFBF7] dark:bg-[#15151A] border-2 border-dashed border-[#18181B]/20 dark:border-[#3F3F4A] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                  <p className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    {locale === "ka" ? "ვადაგადაცილებული ტასკები არ გაქვთ!" : "No urgent or overdue tasks!"}
                  </p>
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    {locale === "ka" ? "დღევანდელი განრიგი სრულად კონტროლქვეშაა. შესანიშნავი ტემპია!" : "You are completely on top of deadlines today. Great pace!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Overdue items */}
                  {overdueTasks.map((tItem) => (
                    <Link
                      key={tItem.id}
                      href={`/app/${workspace.slug}/projects/${tItem.project.slug}/board?taskId=${tItem.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FFF5F5] dark:bg-[#3D1414] hover:bg-[#FEE2E2] dark:hover:bg-[#4D1818] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">{tItem.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="urgent" size="sm">
                          {t.views.myTasks.overdue} ({formatDate(tItem.dueDate)})
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                          {tItem.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Due Today items */}
                  {dueTodayTasks.map((tItem) => (
                    <Link
                      key={tItem.id}
                      href={`/app/${workspace.slug}/projects/${tItem.project.slug}/board?taskId=${tItem.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FEFCE8] dark:bg-[#332B10] hover:bg-[#FEF08A] dark:hover:bg-[#403612] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">{tItem.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="high" size="sm">
                          {t.views.myTasks.today}
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                          {tItem.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Urgent priority items */}
                  {urgentTasks.map((tItem) => (
                    <Link
                      key={tItem.id}
                      href={`/app/${workspace.slug}/projects/${tItem.project.slug}/board?taskId=${tItem.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#1A1A22] hover:bg-[#F5F2EB] dark:hover:bg-[#252530] shadow-retro-sm transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] shrink-0" />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">{tItem.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="urgent" size="sm">
                          {t.priorities.URGENT}
                        </Badge>
                        <span className="text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                          {tItem.project.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#18181B] dark:text-[#F4F4F5]">{t.projects.allProjects}</h2>
              <Link
                href={`/app/${workspace.slug}/projects`}
                className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1"
              >
                <span>{locale === "ka" ? "ყველას ნახვა" : "View all projects"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const total = proj._count.tasks;
                const completed = proj.tasks.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Link
                    key={proj.id}
                    href={`/app/${workspace.slug}/projects/${proj.slug}/board`}
                    className="p-4 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-3 h-3 rounded-full border border-[#18181B] dark:border-[#3F3F4A]"
                          style={{ backgroundColor: proj.accentColor }}
                        />
                        <Badge variant="secondary" size="sm">
                          {proj.status}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-black text-[#18181B] dark:text-[#F4F4F5] truncate mb-1">
                        {proj.name}
                      </h3>
                      {proj.description && (
                        <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E4E4E7] dark:border-[#2E2E38]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                        <span>{locale === "ka" ? "პროგრესი" : "Progress"}</span>
                        <span>{pct}% ({completed}/{total})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F5F2EB] dark:bg-[#202029] border border-[#18181B] dark:border-[#3F3F4A] overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COL: MY TASKS & RECENT ACTIVITY FEED */}
        <div className="space-y-6">
          {/* My Tasks Summary */}
          <Card className="border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro bg-white dark:bg-[#18181D]">
            <CardHeader className="pb-3 border-b border-[#E4E4E7] dark:border-[#2E2E38]">
              <CardTitle className="text-base font-black text-[#18181B] dark:text-[#F4F4F5]">{t.nav.myTasks}</CardTitle>
              <CardDescription className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                {locale === "ka" ? "თქვენზე დანიშნული აქტიური საქმეები" : "Your pending action items"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {myAssignedTasks.length === 0 ? (
                <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] italic py-4 text-center">
                  {t.views.myTasks.emptyGroup}
                </div>
              ) : (
                myAssignedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/app/${workspace.slug}/projects/${task.project.slug}/board?taskId=${task.id}`}
                    className="block p-2.5 rounded-lg border border-[#E4E4E7] dark:border-[#2E2E38] hover:border-[#18181B] dark:hover:border-[#FF6B4A] hover:bg-[#FDFBF7] dark:hover:bg-[#202029] transition-all"
                  >
                    <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate mb-1">
                      {task.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                      <span className="font-semibold">{task.project.name}</span>
                      {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro bg-[#F5F2EB] dark:bg-[#15151A]">
            <CardHeader className="pb-3 border-b border-[#18181B] dark:border-[#3F3F4A]">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
                <CardTitle className="text-base font-black text-[#18181B] dark:text-[#F4F4F5]">
                  {locale === "ka" ? "გუნდის პულსი" : "Team Pulse"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                {locale === "ka" ? "ბოლო აქტივობები სამუშაო სივრცეში" : "Latest activity in this workspace"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] italic py-4 text-center">
                  {t.tasks.noActivity}
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#FF6B4A] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{act.actor.name}</span>{" "}
                      <span className="text-[#52525B] dark:text-[#A1A1AA]">{act.action}</span>{" "}
                      <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                        {act.task?.title || act.project?.name || ""}
                      </span>
                      <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                        {formatDate(act.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
