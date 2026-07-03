import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { streakApi } from "./streakApi";

export const STREAK_QUERY_KEY = ["streak"] as const;

export const useQueryStreakProfile = (enabled = true) => {
  return useQuery({
    queryKey: [...STREAK_QUERY_KEY, "profile"],
    queryFn: () => streakApi.getProfile(),
    enabled,
    staleTime: 60_000,
  });
};

export const useQueryStreakCalendar = (
  year: number,
  month: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: [...STREAK_QUERY_KEY, "calendar", year, month],
    queryFn: () => streakApi.getMonthCalendar(year, month),
    enabled,
    staleTime: 120_000,
  });
};

export const useStreakCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => streakApi.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
