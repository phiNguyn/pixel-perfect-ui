"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/leaderboard/leaderboardInterface";
import { formatWatchHours, getDisplayName } from "@/lib/utils/watchTime";
import { cn } from "@/lib/utils";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

const PODIUM_STYLES: Record<
  1 | 2 | 3,
  { bar: string; ring: string; text: string; height: string; avatar: string }
> = {
  1: {
    bar: "bg-gradient-to-b from-[#f5c243] via-[#f0cb62] to-[#fdf0c4]",
    ring: "ring-[#c6f24e]",
    text: "text-[#1a1a1a]",
    height: "h-[240px] md:h-[280px]",
    avatar: "size-[68px] md:size-[84px]",
  },
  2: {
    bar: "bg-gradient-to-b from-[#e6ebf2] via-[#dbe1ea] to-[#f7f9fc]",
    ring: "ring-[#c6f24e]",
    text: "text-[#1a1a1a]",
    height: "h-[195px] md:h-[228px]",
    avatar: "size-[58px] md:size-[70px]",
  },
  3: {
    bar: "bg-gradient-to-b from-[#c98a4b] via-[#d9a26a] to-[#f0dcc4]",
    ring: "ring-[#c6f24e]",
    text: "text-[#1a1a1a]",
    height: "h-[170px] md:h-[200px]",
    avatar: "size-[52px] md:size-[64px]",
  },
};

function PodiumColumn({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const s = PODIUM_STYLES[place];
  const displayName = getDisplayName(entry.name, entry.username);

  return (
    <div className="flex w-1/3 flex-col items-center justify-end">
      <div className={cn("relative w-full", s.height)}>
        {/* avatar overlapping top of the bar */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <Avatar
            className={cn(
              s.avatar,
              "ring-[3px] ring-offset-0 shadow-xl",
              s.ring,
            )}
          >
            <AvatarImage src={entry.avatar ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/80 text-primary-foreground text-base">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div
          className={cn(
            "flex h-full w-full flex-col items-center rounded-t-[26px] px-1.5 pt-9 md:pt-11 shadow-2xl",
            s.bar,
          )}
        >
          <p
            className={cn(
              "w-full truncate text-center text-[13px] md:text-lg font-extrabold",
              s.text,
            )}
          >
            {displayName}
          </p>

          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-[13px] md:text-base font-bold",
              s.text,
            )}
          >
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {formatWatchHours(entry.totalWatchHours)}
          </div>

          {entry.bio && (
            <p
              className={cn(
                "mt-1 line-clamp-1 px-1 text-center text-[11px] opacity-70",
                s.text,
              )}
            >
              {entry.bio}
            </p>
          )}

          <span
            className={cn(
              "mt-auto pb-3 text-5xl md:text-6xl font-black leading-none",
              s.text,
            )}
          >
            {place}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  // API may return podium unsorted — pick by rank, fallback to order.
  const sorted = [...entries].sort(
    (a, b) => (a?.rank ?? 99) - (b?.rank ?? 99),
  );
  const first = sorted.find((e) => e?.rank === 1) ?? sorted[0];
  const second = sorted.find((e) => e?.rank === 2 && e !== first) ?? sorted[1];
  const third =
    sorted.find((e) => e?.rank === 3 && e !== first && e !== second) ??
    sorted[2];

  return (
    <div className="mt-10 flex items-end justify-center gap-1.5 md:gap-3 px-1">
      {second ? (
        <PodiumColumn entry={second} place={2} />
      ) : (
        <div className="w-1/3" />
      )}
      {first && <PodiumColumn entry={first} place={1} />}
      {third ? (
        <PodiumColumn entry={third} place={3} />
      ) : (
        <div className="w-1/3" />
      )}
    </div>
  );
}
