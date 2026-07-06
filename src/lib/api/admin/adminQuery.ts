import { useQuery } from "@tanstack/react-query";
import { adminApi } from "./adminApi";
import { QueryResult } from "@/hooks/useQueryResult";

export const useAdminQueryStats = (accessToken: string) => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(accessToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};

export const useAdminQueryUsers = (accessToken: string, query: QueryResult) => {
  return useQuery({
    queryKey: ["admin", "users", JSON.stringify(query)],
    queryFn: () => adminApi.getUsers(accessToken, query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};

export const useAdminQueryComments = (
  accessToken: string,
  query: QueryResult,
) => {
  return useQuery({
    queryKey: ["admin", "comments", JSON.stringify(query)],
    queryFn: () => adminApi.getComments(accessToken, query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};
export const useAdminQueryWatchHistory = (
  accessToken: string,
  userId: string,
  query: QueryResult,
) => {
  return useQuery({
    queryKey: ["admin", "watch-history", userId, JSON.stringify(query)],
    queryFn: () => adminApi.getUserWatchHistory(userId, accessToken, query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};

export const useAdminQueryUserStreak = (
  accessToken: string,
  userId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["admin", "streak", userId],
    queryFn: async () => {
      const result = await adminApi.getUserStreak(userId, accessToken);
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch user streak");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled: !!accessToken && !!userId && enabled,
  });
};

export const useAdminQueryUserStreakCalendar = (
  accessToken: string,
  userId: string,
  year: number,
  month: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["admin", "streak-calendar", userId, year, month],
    queryFn: async () => {
      const result = await adminApi.getUserStreakCalendar(
        userId,
        accessToken,
        year,
        month,
      );
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch user streak calendar");
      }
      return result.data.dates;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled: !!accessToken && !!userId && enabled,
  });
};

export const useAdminQueryUserWatchCalendarMonth = (
  accessToken: string,
  userId: string,
  year: number,
  month: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["admin", "watch-calendar-month", userId, year, month],
    queryFn: async () => {
      const result = await adminApi.getUserWatchCalendarMonth(
        userId,
        accessToken,
        year,
        month,
      );
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch user watch calendar");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled: !!accessToken && !!userId && enabled,
  });
};

export const useAdminQueryUserWatchCalendarDay = (
  accessToken: string,
  userId: string,
  date: string | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["admin", "watch-calendar-day", userId, date],
    queryFn: async () => {
      if (!date) throw new Error("Date is required");
      const result = await adminApi.getUserWatchCalendarDay(
        userId,
        accessToken,
        date,
      );
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch user watch calendar day");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled: !!accessToken && !!userId && !!date && enabled,
  });
};
