"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageCircle,
  Trophy,
  TrendingUp,
  Megaphone,
  PartyPopper,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useQueryNotifications,
  useQueryUnreadNotificationCount,
} from "@/lib/api/notification/notificationQuery";
import type {
  NotificationItem,
  NotificationType,
} from "@/lib/api/notification/notificationApi";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/services/dateService";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "comment_reply":
      return MessageCircle;
    case "leaderboard_overtake":
      return Trophy;
    case "rank_change":
      return TrendingUp;
    case "event":
      return PartyPopper;
    default:
      return Megaphone;
  }
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (item: NotificationItem) => void;
}) {
  const Icon = getNotificationIcon(item.type);

  return (
    <button
      type="button"
      onClick={() => onRead(item)}
      className={cn(
        "w-full text-left flex gap-3 px-3 py-2.5 transition-colors hover:bg-accent/60",
        !item.read && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          item.read ? "bg-muted" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", !item.read && "font-medium")}>
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {item.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          {formatTimeAgo(item.createdAt, {
            absoluteAfterDays: 7,
            absoluteFormat: { day: "numeric", month: "short" },
          })}
        </p>
      </div>
      {!item.read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}

type NotificationBellProps = {
  className?: string;
};

export default function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } =
    useQueryUnreadNotificationCount(isAuthenticated);
  const { data, isLoading } = useQueryNotifications(1, 8, false, open);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markRead.mutateAsync(item._id);
    }
    setOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông báo"
          name="notification"
          className={cn(
            "relative p-2 text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,380px)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Chưa có thông báo nào
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <div className="divide-y">
              {notifications.map((item) => (
                <NotificationRow
                  key={item._id}
                  item={item}
                  onRead={handleNotificationClick}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/notifications">Xem tất cả thông báo</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
