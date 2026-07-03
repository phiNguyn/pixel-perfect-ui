"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  MessageCircle,
  Megaphone,
  PartyPopper,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Empty from "@/components/Common/Empty";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useQueryNotifications,
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

export default function NotificationsClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQueryNotifications(
    1,
    50,
    false,
    isAuthenticated,
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markRead.mutateAsync(item._id);
    }
    if (item.link) {
      router.push(item.link);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-16 max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Thông báo</h1>
          <p className="text-sm text-muted-foreground">
            Nhận thông báo khi có người trả lời bình luận, thay đổi xếp hạng và
            nhiều hơn nữa
          </p>
        </div>
        <LoginBenefitsCard
          storageKey="notifications-benefits"
          variant="inline"
          className="mb-6"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Cập nhật mới nhất về hoạt động của bạn
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Đọc tất cả
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          icon={Bell}
          title="Chưa có thông báo"
          description="Khi có hoạt động mới, bạn sẽ thấy thông báo ở đây"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => {
            const Icon = getNotificationIcon(item.type);
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => handleClick(item)}
                className={cn(
                  "flex w-full gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-accent/40",
                  !item.read
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    item.read ? "bg-muted" : "bg-primary/15 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      !item.read && "font-semibold",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    {formatTimeAgo(item.createdAt, {
                      absoluteAfterDays: 30,
                      absoluteFormat: {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    })}
                  </p>
                </div>
                {!item.read && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Muốn tắt một số loại thông báo?{" "}
        <Link href="/settings" className="text-primary hover:underline">
          Cài đặt
        </Link>
      </p>
    </div>
  );
}
