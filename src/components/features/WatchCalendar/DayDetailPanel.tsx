"use client";

import Link from "next/link";
import { CalendarDays, Clock, Film, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CalendarDayData } from "@/lib/api/watchCalendar/watchCalendarInterface";
import { formatWatchDuration, formatWatchHours } from "@/lib/utils/watchTime";
import { normalizeEpisode } from "../../../lib/utils";

interface DayDetailPanelProps {
  data: CalendarDayData | undefined;
  isLoading: boolean;
  selectedDate: string | null;
}

export default function DayDetailPanel({
  data,
  isLoading,
  selectedDate,
}: DayDetailPanelProps) {
  if (!selectedDate) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center text-muted-foreground text-sm">
        Chọn một ngày trên lịch để xem chi tiết
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="font-medium text-sm md:text-base">{data.formattedDate}</p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Clock className="h-4 w-4" />
          {formatWatchHours(data.totalWatchHours)}
        </div>
      </div>

      {data.movies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-muted-foreground text-sm">
          <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Không có phim nào được xem trong ngày này
        </div>
      ) : (
        <div className="space-y-3">
          {data.movies.map((movie) => (
            <div
              key={movie.movieId}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
            >
              <div className="flex gap-3">
                <Link
                  href={`/phim/${movie.movieId}?source=${movie.source}`}
                  className="shrink-0"
                >
                  <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-muted">
                    {movie.moviePoster ? (
                      <img
                        src={movie.moviePoster}
                        alt={movie.movieTitle}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/phim/${movie.movieId}?source=${movie.source}`}
                    className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                  >
                    {movie.movieTitle}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatWatchDuration(movie.totalWatchSeconds)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {movie.episodes
                      .sort(
                        (a, b) => Number(b.episodeSlug) - Number(a.episodeSlug),
                      )
                      .map((ep) => (
                        <div
                          key={ep.episodeSlug}
                          className="w-fit flex items-center justify-between text-xs bg-muted/40 rounded-lg px-2.5 py-1.5"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Play className="h-3 w-3 shrink-0 text-primary" />
                            <span className="truncate">
                              Tập{" "}
                              {normalizeEpisode(
                                ep.episodeName || ep.episodeSlug,
                              )}
                            </span>
                          </div>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            - {formatWatchDuration(ep.watchedSeconds)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
