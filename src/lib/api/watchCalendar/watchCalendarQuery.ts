import { useQuery } from "@tanstack/react-query";
import { watchCalendarApi } from "./watchCalendarApi";

export const useQueryWatchCalendarMonth = (
  year: number,
  month: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["watch-calendar", "month", year, month],
    queryFn: () => watchCalendarApi.getMonthOverview(year, month),
    enabled,
    staleTime: 60_000,
  });
};

export const useQueryWatchCalendarDay = (date: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["watch-calendar", "day", date],
    queryFn: () => watchCalendarApi.getDayDetail(date!),
    enabled: enabled && !!date,
    staleTime: 30_000,
  });
};
