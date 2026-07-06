"use client";

import { useMemo, useState } from "react";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import DayDetailPanel from "@/components/features/WatchCalendar/DayDetailPanel";
import {
  useAdminQueryUserWatchCalendarDay,
  useAdminQueryUserWatchCalendarMonth,
} from "@/lib/api/admin/adminQuery";
import { formatWatchHours } from "@/lib/utils/watchTime";
import { cn } from "@/lib/utils";

interface UserWatchCalendarTabProps {
  userId: string;
  accessToken: string;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function UserWatchCalendarTab({
  userId,
  accessToken,
}: UserWatchCalendarTabProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const selectedDateStr = selectedDate ? toDateString(selectedDate) : null;

  const { data: monthData, isLoading: monthLoading } =
    useAdminQueryUserWatchCalendarMonth(accessToken, userId, year, month);

  const { data: dayData, isLoading: dayLoading } =
    useAdminQueryUserWatchCalendarDay(accessToken, userId, selectedDateStr);

  const postersByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    monthData?.activeDays.forEach((day) => {
      map.set(day.date, day.posters ?? []);
    });
    return map;
  }, [monthData]);

  const watchedDates = useMemo(() => {
    return (
      monthData?.activeDays.map((d) => {
        const [y, m, day] = d.date.split("-").map(Number);
        return new Date(y, m - 1, day);
      }) ?? []
    );
  }, [monthData]);

  const activeDateSet = useMemo(
    () => new Set(monthData?.activeDays.map((d) => d.date) ?? []),
    [monthData],
  );

  const disabledMatchers = useMemo(
    () => [
      { after: today },
      (date: Date) => !activeDateSet.has(toDateString(date)),
    ],
    [activeDateSet, today],
  );

  return (
    <div className="space-y-4">
      {monthData && (
        <p className="text-sm text-muted-foreground text-center">
          Tháng {month}/{year}:{" "}
          <span className="text-primary font-semibold">
            {formatWatchHours(monthData.monthTotalWatchHours)}
          </span>
          {" · "}
          {monthData.activeDays.length} ngày có xem phim
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {monthLoading ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <div className="flex justify-center lg:w-2/3">
            <Calendar
              mode="single"
              locale={vi}
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              toDate={today}
              disabled={disabledMatchers}
              modifiers={{ watched: watchedDates }}
              className="rounded-xl border p-2 w-full"
              classNames={{
                months: "flex flex-col w-full",
                month: "space-y-2 w-full",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell:
                  "text-muted-foreground rounded-md flex-1 font-normal text-[0.7rem]",
                row: "flex w-full gap-0.5 mt-1",
                cell: "flex-1 min-w-0 p-0 relative overflow-visible",
                day: "group h-auto w-full p-0 font-normal rounded-none bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 flex flex-col items-center gap-0.5 aria-disabled:opacity-40 aria-disabled:pointer-events-none",
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
                          "text-xs leading-none font-semibold tabular-nums",
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
                          "relative aspect-square w-full rounded-md border bg-muted/20 overflow-visible",
                          !isDisabled && "group-hover:border-primary/30",
                          isSelected && "border-primary ring-2 ring-primary/80",
                          isToday && !isSelected && "border-primary/40",
                          isDisabled &&
                            !isOutside &&
                            "border-transparent opacity-40",
                          isOutside && "border-transparent opacity-0",
                        )}
                        aria-hidden={isOutside}
                      >
                        {!isOutside && posters.length > 0 && (
                          <div className="absolute inset-0 flex items-end justify-center pb-0.5 overflow-visible">
                            {posters.map((src, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={src}
                                alt=""
                                loading="lazy"
                                style={{ zIndex: 10 + i }}
                                className={cn(
                                  "relative h-8 w-6 rounded object-cover ring-1 ring-background/80 bg-muted shadow-md",
                                  i > 0 && "-ml-3",
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
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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

        <div className="lg:w-1/3">
          <DayDetailPanel
            data={dayData}
            isLoading={dayLoading}
            selectedDate={selectedDateStr}
          />
        </div>
      </div>
    </div>
  );
}
