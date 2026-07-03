"use client";

import { useMemo } from "react";
import { Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStreakDialog } from "@/stores/useStreakDialog";
import {
  useQueryStreakCalendar,
  useQueryStreakProfile,
} from "@/lib/api/streak/streakQuery";
import { useAuth } from "@/components/auth/AuthProvider";
import StreakCalendar from "./StreakCalendar";
import AchievementBadge from "./AchievementBadge";

export default function StreakDetailDialog() {
  const { open, setOpen } = useStreakDialog();
  const { isAuthenticated } = useAuth();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: profile } = useQueryStreakProfile(isAuthenticated && open);
  const { data: monthDates = [] } = useQueryStreakCalendar(
    year,
    month,
    isAuthenticated && open,
  );

  const unlockedCount = useMemo(
    () => profile?.badges.filter((b) => b.unlocked).length ?? 0,
    [profile?.badges],
  );

  if (!isAuthenticated) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/10 bg-background/95 p-0 backdrop-blur-xl sm:max-w-md">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-500/15 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />

          <DialogHeader className="relative px-6 pb-2 pt-6">
            <DialogTitle className="sr-only">Chuỗi ghé thăm</DialogTitle>
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/30"
              >
                <Flame className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-4xl font-bold tabular-nums">
                {profile?.totalActiveDays ?? 0}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ngày ghé thăm Pinuss Flix
              </p>
              {profile?.checkedInToday ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Hôm nay đã ghé ✓
                </span>
              ) : (
                <span className="mt-2 text-xs text-muted-foreground">
                  Mở app là +1 ngày — không bao giờ mất chuỗi cũ
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="relative space-y-6 px-6 pb-6 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-sm font-semibold">
                Lịch tháng {month}/{year}
              </p>
              <StreakCalendar
                year={year}
                month={month}
                checkInDates={monthDates}
              />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
