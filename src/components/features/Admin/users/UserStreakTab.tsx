"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StreakCalendar from "@/components/features/Streak/StreakCalendar";
import AchievementBadge from "@/components/features/Streak/AchievementBadge";
import {
  useAdminQueryUserStreak,
  useAdminQueryUserStreakCalendar,
} from "@/lib/api/admin/adminQuery";

interface UserStreakTabProps {
  userId: string;
  accessToken: string;
}

export default function UserStreakTab({
  userId,
  accessToken,
}: UserStreakTabProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const { data: profile, isLoading: profileLoading } = useAdminQueryUserStreak(
    accessToken,
    userId,
  );

  const { data: monthDates = [], isLoading: calendarLoading } =
    useAdminQueryUserStreakCalendar(
      accessToken,
      userId,
      currentMonth.year,
      currentMonth.month,
    );

  const unlockedCount = useMemo(
    () => profile?.badges.filter((b) => b.unlocked).length ?? 0,
    [profile?.badges],
  );

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-orange-500/10 to-amber-500/5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/20">
          <Flame className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums">
            {profile?.totalActiveDays ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">ngày ghé thăm</p>
          {profile?.checkedInToday ? (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
              <Sparkles className="h-3 w-3" />
              Hôm nay đã ghé
            </span>
          ) : (
            <span className="mt-1 text-xs text-muted-foreground">
              Hôm nay chưa ghé
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Lịch tháng {currentMonth.month}/{currentMonth.year}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {calendarLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <StreakCalendar
            year={currentMonth.year}
            month={currentMonth.month}
            checkInDates={monthDates}
          />
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Huy hiệu thành tích</p>
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{profile?.badges.length ?? 0}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {profile?.badges.map((badge) => (
            <AchievementBadge
              key={badge.id}
              name={badge.name}
              description={badge.description}
              icon={badge.icon}
              tier={badge.tier}
              unlocked={badge.unlocked}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
