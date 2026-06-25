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

const LOGIN_SHOWCASE_POSTERS = [
  {
    src: "/images/movie1.jpg",
    className:
      "z-10 h-40 w-28 sm:h-44 sm:w-32 -translate-x-[5.5rem] sm:-translate-x-[6.5rem] -rotate-[16deg]",
  },
  {
    src: "/images/movie2.jpg",
    className:
      "z-20 h-44 w-[7.25rem] sm:h-48 sm:w-32 -translate-x-[2.75rem] sm:-translate-x-[3.25rem] -rotate-[7deg]",
  },
  {
    src: "/images/movie3.jpg",
    className:
      "z-30 h-48 w-32 sm:h-52 sm:w-36 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]",
  },
  {
    src: "/images/movie4.jpg",
    className:
      "z-20 h-44 w-[7.25rem] sm:h-48 sm:w-32 translate-x-[2.75rem] sm:translate-x-[3.25rem] rotate-[7deg]",
  },
  {
    src: "/images/movie5.jpg",
    className:
      "z-10 h-40 w-28 sm:h-44 sm:w-32 translate-x-[5.5rem] sm:translate-x-[6.5rem] rotate-[16deg]",
  },
] as const;

export default function WatchCalendarClient() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const selectedDateStr = selectedDate ? toDateString(selectedDate) : null;

  const { data: monthData, isLoading: monthLoading } =
    useQueryWatchCalendarMonth(year, month, isAuthenticated);

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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-10 sm:px-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-8 h-40 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative mx-auto mb-8 h-48 w-full max-w-sm sm:h-52">
            {LOGIN_SHOWCASE_POSTERS.map((poster, i) => (
              <div
                key={poster.src}
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-[1.03]",
                  poster.className,
                )}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded-lg object-cover ring-2 ring-background/70 bg-muted shadow-xl"
                />
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-2">Lịch xem phim</h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
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
    <div className="max-w-2xl lg:max-w-6xl mx-auto px-4 py-8 mt-16">
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

        <div className="p-2 md:p-6 flex flex-col lg:flex-row md:gap-x-5">
          {monthLoading ? (
            <Skeleton className="h-[480px] md:h-[540px] w-full rounded-xl" />
          ) : (
            <div className="flex justify-center lg:w-2/3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={{ after: today }}
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
                  row: "flex w-full gap-0.5 md:gap-1 mt-1 md:mt-2",
                  cell: "flex-1 min-w-0 p-0 relative overflow-visible",
                  day: "group h-auto w-full p-0 font-normal rounded-none bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 flex flex-col items-center gap-0.5 md:gap-1 aria-disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed",
                  day_selected:
                    "bg-transparent text-foreground hover:bg-transparent",
                  day_today: "",
                  day_outside: "opacity-100",
                }}
                components={{
                  DayContent: ({ date, activeModifiers }) => {
                    const key = toDateString(date);
                    const posters = postersByDate.get(key) ?? [];
                    const isOutside = activeModifiers.outside;
                    const isSelected = activeModifiers.selected;
                    const isToday = activeModifiers.today;
                    const isDisabled = activeModifiers.disabled;
                    const isWatched =
                      !isOutside &&
                      posters.length === 0 &&
                      activeModifiers.watched;

                    return (
                      <>
                        <span
                          className={cn(
                            "text-[0.65rem] md:text-xs leading-none font-semibold tabular-nums",
                            isOutside && "text-muted-foreground/40",
                            isDisabled &&
                              !isOutside &&
                              "text-muted-foreground/30",
                            isSelected && "text-primary",
                            isToday && !isSelected && "text-primary/80",
                          )}
                        >
                          {date.getDate()}
                        </span>

                        <div
                          className={cn(
                            "relative aspect-square w-full rounded-md border border-white/10 bg-muted/20 transition-colors overflow-visible",
                            !isDisabled &&
                              "group-hover:border-white/20 group-hover:bg-muted/35",
                            isSelected &&
                              "border-primary ring-2 ring-primary/80 bg-primary/10",
                            isToday && !isSelected && "border-primary/40",
                            isDisabled &&
                              !isOutside &&
                              "border-transparent bg-transparent opacity-40",
                            isOutside &&
                              "border-transparent bg-transparent opacity-0",
                          )}
                          aria-hidden={isOutside}
                        >
                          {!isOutside && posters.length > 0 && (
                            <div className="absolute inset-0 flex items-end justify-center pb-0.5 md:pb-1 overflow-visible">
                              {posters.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={i}
                                  src={src}
                                  alt=""
                                  loading="lazy"
                                  style={{ zIndex: 10 + i }}
                                  className={cn(
                                    "relative h-8 w-6 sm:h-10 sm:w-7 md:h-14 md:w-10 lg:h-16 lg:w-12 rounded-[3px] md:rounded object-cover ring-1 ring-background/80 bg-muted shadow-md",
                                    i > 0 && "-ml-3 sm:-ml-4 md:-ml-5 lg:-ml-6",
                                    i % 2 === 0
                                      ? "-rotate-[12deg]"
                                      : "rotate-[12deg]",
                                  )}
                                />
                              ))}
                            </div>
                          )}

                          {isWatched && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary" />
                            </span>
                          )}
                        </div>
                      </>
                    );
                  },
                }}
              />
            </div>
          )}

          <div className="mt-6 lg:mt-0 lg:w-1/3">
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
