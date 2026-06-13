"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DayDetailPanel from "@/components/features/WatchCalendar/DayDetailPanel";
import {
  useQueryWatchCalendarDay,
  useQueryWatchCalendarMonth,
} from "@/lib/api/watchCalendar/watchCalendarQuery";
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
    <div className="max-w-2xl mx-auto px-4 py-8 mt-16">
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

        <div className="p-4 md:p-6">
          {monthLoading ? (
            <Skeleton className="h-[320px] w-full rounded-xl" />
          ) : (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{ watched: watchedDates }}
                modifiersClassNames={{
                  watched:
                    "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary font-semibold",
                }}
                className={cn(
                  "rounded-xl border border-white/10 bg-background/50 p-3 pointer-events-auto",
                )}
                classNames={{
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "border border-primary/50",
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
