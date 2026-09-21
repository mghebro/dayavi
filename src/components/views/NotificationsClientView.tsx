"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Calendar,
  MessageSquare,
  Building2,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/server/actions/notification";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

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
        return <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />;
      case "TASK_DUE_SOON":
      case "TASK_OVERDUE":
        return <Calendar className="w-4 h-4 text-[#F59E0B]" />;
      case "WORKSPACE_INVITE":
      case "PROJECT_INVITE":
        return <Building2 className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Bell className="w-4 h-4 text-[#18181B]" />;
    }
  };

  const renderList = (title: string, list: NotificationItem[]) => (
    <div className="space-y-3">
      <div className="text-xs font-black text-[#71717A] uppercase tracking-wider">
        {title}
      </div>
      {list.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-[#18181B]/20 bg-white/50 text-xs text-[#A1A1AA] italic">
          No notifications for this timeframe.
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-xl border-2 border-[#18181B] bg-white shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                !item.read ? "border-l-4 border-l-[#FF6B4A]" : "opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#FDFBF7] border border-[#18181B] mt-0.5">
                  {renderIcon(item.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#18181B]">
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                    )}
                  </div>
                  <p className="text-xs text-[#52525B] font-medium leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-bold text-[#A1A1AA] shrink-0 mt-1">
                {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-[#18181B]">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#E0D8FF] border border-[#18181B] text-[11px] font-black text-[#18181B] mb-1">
            COMMUNICATION INBOX
          </div>
          <h1 className="text-3xl font-black text-[#18181B] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium">
            Stay updated with task assignments, deadlines, and project invitations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="font-bold gap-1.5"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </Button>
      </div>

      {/* Lists */}
      <div className="space-y-6">
        {renderList("Today", today)}
        {renderList("Earlier", earlier)}
      </div>
    </div>
  );
}
