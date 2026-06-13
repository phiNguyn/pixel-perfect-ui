"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/leaderboard/leaderboardInterface";
import { formatWatchHours, getDisplayName } from "@/lib/utils/watchTime";
import { cn } from "@/lib/utils";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

function PodiumUser({
  entry,
  size,
  isFirst,
}: {
  entry: LeaderboardEntry;
  size: "lg" | "md";
  isFirst?: boolean;
}) {
  const displayName = getDisplayName(entry.name, entry.username);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-3">
        {isFirst && (
          <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-5 w-5 text-amber-400 fill-amber-400/20" />
        )}
        <Avatar
          className={cn(
            "border-2 border-white/20 shadow-lg",
            size === "lg" ? "h-20 w-20 md:h-24 md:w-24" : "h-16 w-16 md:h-20 md:w-20",
            isFirst && "border-amber-400/60",
          )}
        >
          <AvatarImage src={entry.avatar ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/80 text-primary-foreground text-lg">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
            isFirst
              ? "bg-amber-400 text-amber-950"
              : "bg-muted text-foreground border border-border",
          )}
        >
          {entry.rank}
        </span>
      </div>

      <p className="font-semibold text-sm md:text-base truncate max-w-[120px]">
        {displayName}
      </p>
      {entry.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[140px] mt-1">
          {entry.bio}
        </p>
      )}
      <p className="text-sm font-bold text-primary mt-2">
        {formatWatchHours(entry.totalWatchHours)}
      </p>
    </div>
  );
}

export default function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  const [second, first, third] =
    entries.length >= 3
      ? entries
      : entries.length === 2
        ? [entries[0], entries[1], undefined]
        : [undefined, entries[0], undefined];

  return (
    <div className="flex items-end justify-center gap-2 md:gap-6 py-6 px-2">
      {second && (
        <div className="pb-4 order-1 flex-1">
          <PodiumUser entry={second} size="md" />
        </div>
      )}
      {first && (
        <div className="order-2 flex-1">
          <PodiumUser entry={first} size="lg" isFirst />
        </div>
      )}
      {third && (
        <div className="pb-6 order-3 flex-1">
          <PodiumUser entry={third} size="md" />
        </div>
      )}
    </div>
  );
}
