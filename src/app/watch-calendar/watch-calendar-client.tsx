"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, LogIn } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DayDetailPanel from "@/components/features/WatchCalendar/DayDetailPanel";
import {
  useQueryWatchCalendarDay,
  useQueryWatchCalendarMonth,
} from "@/lib/api/watchCalendar/watchCalendarQuery";
import { watchCalendarApi } from "@/lib/api/watchCalendar/watchCalendarApi";
import type { CalendarDayData } from "@/lib/api/watchCalendar/watchCalendarInterface";
import { formatWatchHours } from "@/lib/utils/watchTime";
import { cn } from "@/lib/utils";

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WatchCalendarClient() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const selectedDateStr = selectedDate ? toDateString(selectedDate) : null;

  const { data: monthData, isLoading: monthLoading } = useQueryWatchCalendarMonth(
    year,
    month,
    isAuthenticated,
  );

  const { data: dayData, isLoading: dayLoading } = useQueryWatchCalendarDay(
    selectedDateStr,
    isAuthenticated,
  );

  const activeDateStrings = useMemo(
    () => monthData?.activeDays.map((d) => d.date) ?? [],
    [monthData],
  );

  // Prefetch each active day's detail in parallel to get poster thumbnails
  const dayDetailQueries = useQueries({
    queries: activeDateStrings.map((date) => ({
      queryKey: ["watch-calendar", "day", date],
      queryFn: () => watchCalendarApi.getDayDetail(date),
      enabled: isAuthenticated,
      staleTime: 5 * 60_000,
    })),
  });

  // Map: "YYYY-MM-DD" -> up to 3 poster URLs
  const postersByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    dayDetailQueries.forEach((q, idx) => {
      const date = activeDateStrings[idx];
      const data = q.data as CalendarDayData | undefined;
      if (!date || !data) return;
      const posters = data.movies
        .map((m) => m.moviePoster)
        .filter((p): p is string => !!p)
        .slice(0, 3);
      map.set(date, posters);
    });
    return map;
  }, [dayDetailQueries, activeDateStrings]);

  const watchedDates = useMemo(() => {
    return (
      monthData?.activeDays.map((d) => {
        const [y, m, day] = d.date.split("-").map(Number);
        return new Date(y, m - 1, day);
      }) ?? []
    );
  }, [monthData]);

  useEffect(() => {
    if (isAuthenticated && !selectedDate) {
      setSelectedDate(today);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 mt-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-primary opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Lịch xem phim</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Đăng nhập để xem lịch sử xem phim theo từng ngày
          </p>
          <Button onClick={openLoginModal}>
            <LogIn className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl md:max-w-4xl mx-auto px-4 py-8 mt-16">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Lịch xem phim</h1>
          </div>
          {monthData && (
            <p className="text-center text-sm text-muted-foreground">
              Tháng này:{" "}
              <span className="text-primary font-semibold">
                {formatWatchHours(monthData.monthTotalWatchHours)}
              </span>
              {" · "}
              {monthData.activeDays.length} ngày có xem phim
            </p>
          )}
        </div>

        <div className="p-2 md:p-6">
          {monthLoading ? (
            <Skeleton className="h-[360px] w-full rounded-xl" />
          ) : (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{ watched: watchedDates }}
                className={cn(
                  "rounded-xl border border-white/10 bg-background/50 p-2 pointer-events-auto w-full",
                )}
                classNames={{
                  months: "flex flex-col w-full",
                  month: "space-y-2 w-full",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell:
                    "text-muted-foreground rounded-md flex-1 font-normal text-[0.7rem]",
                  row: "flex w-full mt-1",
                  cell: "flex-1 aspect-square text-center text-xs p-0.5 relative",
                  day: "h-full w-full p-0 font-normal rounded-md hover:bg-accent/60 transition-colors flex flex-col items-center justify-start pt-1 gap-1 overflow-hidden",
                  day_selected:
                    "bg-primary/20 ring-2 ring-primary text-foreground hover:bg-primary/30",
                  day_today: "border border-primary/50",
                  day_outside: "opacity-30",
                }}
                components={{
                  DayContent: ({ date, activeModifiers }) => {
                    const key = toDateString(date);
                    const posters = postersByDate.get(key) ?? [];
                    const isOutside = activeModifiers.outside;
                    return (
                      <>
                        <span className="text-[0.7rem] leading-none font-medium">
                          {date.getDate()}
                        </span>
                        {!isOutside && posters.length > 0 && (
                          <div className="flex -space-x-1.5 mt-0.5">
                            {posters.map((src, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={src}
                                alt=""
                                loading="lazy"
                                className="h-5 w-4 rounded-[2px] object-cover ring-1 ring-background/80 bg-muted"
                              />
                            ))}
                          </div>
                        )}
                        {!isOutside && posters.length === 0 && activeModifiers.watched && (
                          <span className="h-1 w-1 rounded-full bg-primary mt-1" />
                        )}
                      </>
                    );
                  },
                }}
              />
            </div>
          )}

          <div className="mt-6">
            <DayDetailPanel
              data={dayData}
              isLoading={dayLoading}
              selectedDate={selectedDateStr}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
