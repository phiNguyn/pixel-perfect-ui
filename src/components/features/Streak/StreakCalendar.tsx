"use client";

import { cn } from "@/lib/utils";

type StreakCalendarProps = {
  year: number;
  month: number;
  checkInDates: string[];
  className?: string;
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: Array<{ day: number | null; date: string | null }> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, date: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, date });
  }

  return cells;
}

export default function StreakCalendar({
  year,
  month,
  checkInDates,
  className,
}: StreakCalendarProps) {
  const checkedSet = new Set(checkInDates);
  const cells = getCalendarCells(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-[10px] font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const checked = checkedSet.has(cell.date);
          const isToday = cell.date === todayStr;

          return (
            <div
              key={cell.date}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors",
                checked
                  ? "bg-gradient-to-br from-orange-500/80 to-amber-500/60 text-white shadow-sm shadow-orange-500/20"
                  : "bg-muted/40 text-muted-foreground",
                isToday &&
                  "ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
              )}
            >
              {cell.day}
              {checked && (
                <span className="absolute -right-0.5 -top-0.5 text-[8px]">
                  🔥
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
