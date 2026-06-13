"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/api/leaderboard/leaderboardInterface";
import { formatWatchHours, getDisplayName } from "@/lib/utils/watchTime";

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardList({ entries }: LeaderboardListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const displayName = getDisplayName(entry.name, entry.username);

        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 transition-colors hover:bg-white/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {entry.rank}
            </span>

            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={entry.avatar ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/80 text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{displayName}</p>
              {entry.bio && (
                <p className="text-xs text-muted-foreground truncate">
                  {entry.bio}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-sm font-semibold text-primary">
              <Clock className="h-3.5 w-3.5" />
              {formatWatchHours(entry.totalWatchHours)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
