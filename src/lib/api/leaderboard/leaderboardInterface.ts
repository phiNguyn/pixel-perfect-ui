export type LeaderboardPeriod = "all" | "week" | "month";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  totalWatchSeconds: number;
  totalWatchHours: number;
}

export interface LeaderboardData {
  period: LeaderboardPeriod;
  myRank: number | null;
  myTotalWatchSeconds: number;
  myTotalWatchHours: number;
  podium: LeaderboardEntry[];
  list: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MyRankData {
  rank: number | null;
  totalWatchSeconds: number;
  totalWatchHours: number;
  period: LeaderboardPeriod;
}
