"use client";

import { ChevronRight, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQueryStreakProfile } from "@/lib/api/streak/streakQuery";
import { useStreakDialog } from "@/stores/useStreakDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function StreakHomeCard() {
  const { isAuthenticated } = useAuth();
  const { setOpen } = useStreakDialog();
  const { data, isLoading } = useQueryStreakProfile(isAuthenticated);

  if (!isAuthenticated) return null;
  if (isLoading) return <Skeleton className="w-full h-[116px] md:h-[218px]" />;
  const days = data?.totalActiveDays ?? 0;
  const unlockedBadges = data?.badges.filter((b) => b.unlocked).length ?? 0;
  const totalBadges = data?.badges.length ?? 0;

  return (
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative mb-6 w-full overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-4 text-left backdrop-blur-sm transition-all hover:border-orange-500/35 hover:shadow-lg hover:shadow-orange-500/10 md:p-5"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/15 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-center md:gap-4 gap-2">
        <div className="flex size-12 md:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/25">
          <Flame className=" size-6 md:size-7 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-sm md:text-base">
              Chuỗi ghé thăm
            </h3>
            {data?.checkedInToday && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                Hôm nay ✓
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-semibold text-orange-400">{days}</span> ngày
            ghé thăm · {unlockedBadges}/{totalBadges} huy hiệu
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            Mở app mỗi ngày để tích lũy — không bao giờ reset
          </p>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}
