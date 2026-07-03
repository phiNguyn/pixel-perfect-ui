"use client";

import { Flame } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQueryStreakProfile } from "@/lib/api/streak/streakQuery";
import { useStreakDialog } from "@/stores/useStreakDialog";
import { cn } from "@/lib/utils";

type StreakBadgeButtonProps = {
  className?: string;
};

export default function StreakBadgeButton({
  className,
}: StreakBadgeButtonProps) {
  const { isAuthenticated } = useAuth();
  const { setOpen } = useStreakDialog();
  const { data } = useQueryStreakProfile(isAuthenticated);

  if (!isAuthenticated) return null;

  const days = data?.totalActiveDays ?? 0;

  return (
    <button
      type="button"
      aria-label="Chuỗi ghé thăm"
      onClick={() => setOpen(true)}
      className={cn(
        "group relative flex items-center gap-1 rounded-full px-2 py-1.5 transition-colors hover:bg-orange-500/10",
        className,
      )}
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-sm shadow-orange-500/25 transition-transform group-hover:scale-105">
        <Flame className="h-4 w-4 text-white" />
      </span>
      <span className="min-w-[1.25rem] text-sm font-bold tabular-nums text-orange-400">
        {days}
      </span>
    </button>
  );
}
