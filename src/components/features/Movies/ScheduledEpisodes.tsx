"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useQueryScheduledEpisodes } from "@/lib/api/scheduledEpisodes/scheduledEpisodesQuery";
import type { ScheduledEpisode } from "@/lib/api/scheduledEpisodes/scheduledEpisodesInterface";
import { cn } from "@/lib/utils";

interface ScheduledEpisodesProps {
  movieSlug?: string;
  enabled?: boolean;
}

// air_date arrives as "dd-mm-yyyy"
function parseAirDate(value: string): number {
  const [day, month, year] = value.split("-").map(Number);
  if (!day || !month || !year) return Number.MAX_SAFE_INTEGER;
  return new Date(year, month - 1, day).getTime();
}

export default function ScheduledEpisodes({
  movieSlug,
  enabled = false,
}: ScheduledEpisodesProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useQueryScheduledEpisodes(
    movieSlug,
    enabled,
  );

  const { featured, others } = useMemo(() => {
    const list = [...(data ?? [])].sort(
      (a, b) => parseAirDate(a.air_date) - parseAirDate(b.air_date),
    );

    if (list.length === 0) {
      return { featured: null as ScheduledEpisode | null, others: [] };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let featuredIndex = list.findIndex(
      (item) => parseAirDate(item.air_date) >= startOfToday.getTime(),
    );
    if (featuredIndex === -1) featuredIndex = list.length - 1;

    return {
      featured: list[featuredIndex],
      others: list.filter((_, index) => index !== featuredIndex),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="mb-4 h-16 w-full animate-pulse rounded-2xl bg-secondary/40" />
    );
  }

  if (isError || !featured) return null;

  const hasOthers = others.length > 0;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-primary/15 via-secondary/30 to-secondary/40 backdrop-blur-md">
      {/* Banner row */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Bell className="h-4 w-4" />
        </span>

        <p className="flex-1 text-sm text-foreground">
          <span className="font-semibold">{featured.episode}</span> sẽ phát sóng{" "}
          <span className="font-semibold text-primary">
            ngày {featured.air_date}
          </span>
          . Các bạn nhớ đón xem nhé
        </p>

        {hasOthers && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/40 hover:text-foreground"
          >
            {expanded ? "Thu gọn" : "Lịch chiếu khác"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {/* Expanded schedule grid */}
      {hasOthers && expanded && (
        <div className="grid grid-cols-1 gap-2 border-t border-border/50 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          {others.map((item) => (
            <div
              key={`${item.episode}-${item.air_date}`}
              className="flex items-center gap-2 rounded-lg bg-background/40 p-1.5"
            >
              <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                {item.episode}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.air_date}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
