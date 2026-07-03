import {
  Crown,
  Flame,
  Sparkles,
  Sun,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { BadgeTier } from "@/lib/api/streak/streakApi";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  flame: Flame,
  sun: Sun,
  crown: Crown,
  trophy: Trophy,
};

const TIER_STYLES: Record<
  BadgeTier,
  { ring: string; bg: string; glow: string }
> = {
  bronze: {
    ring: "ring-amber-700/40",
    bg: "bg-gradient-to-br from-amber-700/30 via-amber-600/20 to-orange-800/10",
    glow: "shadow-amber-700/20",
  },
  silver: {
    ring: "ring-slate-300/40",
    bg: "bg-gradient-to-br from-slate-400/30 via-slate-300/20 to-slate-500/10",
    glow: "shadow-slate-400/20",
  },
  gold: {
    ring: "ring-yellow-400/50",
    bg: "bg-gradient-to-br from-yellow-500/35 via-amber-400/25 to-orange-500/15",
    glow: "shadow-yellow-500/30",
  },
  special: {
    ring: "ring-violet-400/50",
    bg: "bg-gradient-to-br from-violet-500/35 via-fuchsia-500/25 to-pink-500/15",
    glow: "shadow-violet-500/30",
  },
};

type AchievementBadgeProps = {
  name: string;
  description?: string;
  icon: string;
  tier: BadgeTier;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

export default function AchievementBadge({
  name,
  description,
  icon,
  tier,
  unlocked = true,
  size = "md",
  showLabel = true,
  className,
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[icon] ?? Sparkles;
  const styles = TIER_STYLES[tier];

  const sizeClasses = {
    sm: { wrap: "h-12 w-12", icon: "h-5 w-5", text: "text-[10px]" },
    md: { wrap: "h-16 w-16", icon: "h-7 w-7", text: "text-xs" },
    lg: { wrap: "h-20 w-20", icon: "h-9 w-9", text: "text-sm" },
  }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 text-center",
        !unlocked && "opacity-40 grayscale",
        className,
      )}
      title={description}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl ring-2 shadow-lg",
          sizeClasses.wrap,
          styles.ring,
          styles.bg,
          styles.glow,
          unlocked && "animate-none",
        )}
      >
        <Icon className={cn(sizeClasses.icon, "text-foreground/90")} />
        {!unlocked && (
          <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-[1px]" />
        )}
      </div>
      {showLabel && (
        <span
          className={cn(
            "max-w-[72px] font-medium leading-tight text-foreground/90",
            sizeClasses.text,
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
}
