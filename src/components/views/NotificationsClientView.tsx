"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Calendar,
  MessageSquare,
  Building2,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/server/actions/notification";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string;
  read: boolean;
  createdAt: Date | string;
}

interface NotificationsClientViewProps {
  today: NotificationItem[];
  earlier: NotificationItem[];
  workspaceSlug: string;
}

export function NotificationsClientView({
  today,
  earlier,
  workspaceSlug,
}: NotificationsClientViewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    toast.success("All notifications marked as read");
    router.refresh();
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await markNotificationReadAction(notification.id);
    }
    router.push(notification.linkUrl);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <FolderKanban className="w-4 h-4 text-[#FF6B4A]" />;
      case "TASK_COMMENT":
        return <MessageSquare className="w-4 h-4 text-[#8B5CF6] dark:text-[#A78BFA]" />;
      case "TASK_DUE_SOON":
      case "TASK_OVERDUE":
        return <Calendar className="w-4 h-4 text-[#F59E0B]" />;
      case "WORKSPACE_INVITE":
      case "PROJECT_INVITE":
        return <Building2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />;
      default:
        return <Bell className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />;
    }
  };

  const renderList = (title: string, list: NotificationItem[]) => (
    <div className="space-y-3">
      <div className="text-xs font-black text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
        {title}
      </div>
      {list.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-[#18181B]/20 dark:border-[#3F3F4A] bg-white/50 dark:bg-[#15151A] text-xs text-[#A1A1AA] italic">
          {t.notifications.noNotifications}
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3.5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] transition-all cursor-pointer flex items-start gap-3 select-none ${
                n.read
                  ? "bg-white dark:bg-[#18181D] opacity-75 shadow-retro-sm"
                  : "bg-[#FEF08A]/30 dark:bg-[#3D3512]/40 shadow-retro font-semibold"
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg border border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#202029]">
                {renderIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-[#18181B] dark:text-[#F4F4F5] truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] shrink-0 font-medium">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#3F3F46] dark:text-[#A1A1AA] mt-0.5 line-clamp-2">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A] shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-[#18181B] dark:border-[#3F3F4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#F4F4F5] tracking-tight">
            {t.notifications.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-medium mt-1">
            {t.notifications.subtitle}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="font-bold gap-1.5"
        >
          <CheckCheck className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
          <span>{t.notifications.markAllRead}</span>
        </Button>
      </div>

      {/* Notifications Streams */}
      <div className="space-y-6">
        {renderList(t.views.myTasks.today, today)}
        {renderList(t.views.myTasks.upcoming, earlier)}
      </div>
    </div>
  );
}
