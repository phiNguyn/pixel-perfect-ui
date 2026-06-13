import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "./leaderboardApi";
import type { LeaderboardPeriod } from "./leaderboardInterface";
import { useAuthStore } from "@/stores/useAuthStore";

export const useQueryLeaderboard = (
  period: LeaderboardPeriod = "all",
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: ["leaderboard", period, page, limit],
    queryFn: () => leaderboardApi.getLeaderboard(period, page, limit),
    staleTime: 60_000,
  });
};

export const useQueryMyRank = (
  period: LeaderboardPeriod = "all",
  enabled = true,
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["leaderboard", "me", period],
    queryFn: () => leaderboardApi.getMyRank(period),
    enabled: enabled && isAuthenticated,
    staleTime: 60_000,
  });
};
