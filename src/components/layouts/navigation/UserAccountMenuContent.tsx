"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  History,
  LogOut,
  Settings,
  Shield,
  Trophy,
} from "lucide-react";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import type { User } from "@/stores/useAuthStore";

type UserAccountMenuContentProps = {
  user: User | null;
  onNavigate?: () => void;
  onLogout: () => void;
};

export default function UserAccountMenuContent({
  user,
  onNavigate,
  onLogout,
}: UserAccountMenuContentProps) {
  return (
    <>
      <div className="flex flex-col space-y-1 p-2">
        <p className="text-sm font-medium leading-none">
          {user?.name || "Người dùng"}
        </p>
        {user?.email && (
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        )}
      </div>
      <div className="h-px bg-border my-1" />
      <Link
        href="/notifications"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        <span>Thông báo</span>
      </Link>
      <Link
        href="/watch-histories"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <History className="h-4 w-4" />
        <span>Lịch sử xem</span>
      </Link>
      <Link
        href="/watch-calendar"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <CalendarDays className="h-4 w-4" />
        <span>Lịch xem phim</span>
      </Link>
      <Link
        href="/leaderboard"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <Trophy className="h-4 w-4" />
        <span>Bảng xếp hạng</span>
      </Link>
      <Link
        href="/settings"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <Settings className="h-4 w-4" />
        <span>Cài đặt</span>
      </Link>
      {user?.role === "admin" && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
        >
          <Shield className="h-4 w-4" />
          <span>Portal</span>
        </Link>
      )}
      <div className="h-px bg-border my-1" />
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-sm text-muted-foreground">Giao diện</span>
        <ThemeSelector />
      </div>
      <div className="h-px bg-border my-1" />
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          onLogout();
        }}
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Đăng xuất</span>
      </button>
    </>
  );
}
