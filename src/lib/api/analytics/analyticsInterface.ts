// Analytics API Response Types

export interface UserOverviewStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  byProvider: {
    local: number;
    google: number;
  };
  activeUsers: number;
  inactiveUsers: number;
}

export interface UserGrowthResult {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface DailyActiveUser {
  date: string;
  count: number;
}

export interface RetentionData {
  day: number;
  retainedUsers: number;
  retentionRate: number;
}

export interface UserSegmentData {
  segment: "casual" | "engaged" | "power_user";
  label: string;
  count: number;
  percentage: number;
}

export interface TopMovie {
  movieId: string;
  movieTitle: string;
  views: number;
  uniqueViewers: number;
}

export interface TrendingMovie {
  movieId: string;
  movieTitle: string;
  views: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export interface ViewSourceStats {
  source: string;
  views: number;
  percentage: number;
}

export interface CompletionRateStats {
  movieId: string;
  movieTitle: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
}

export interface WatchTimeStats {
  avgWatchTimeSeconds: number;
  avgWatchTimeFormatted: string;
  totalWatchTimeSeconds: number;
  totalWatchTimeFormatted: string;
}

export interface DropOffPoint {
  progressPercent: number;
  userCount: number;
  percentage: number;
}

export interface MovieEngagementStats {
  movieId: string;
  movieTitle: string;
  views: number;
  favorites: number;
  comments: number;
  shares: number;
  watchlistAdds: number;
  completionRate: number;
}

export interface FavoriteStats {
  totalFavorites: number;
  topFavoritedMovies: Array<{
    movieId: string;
    movieTitle: string;
    count: number;
  }>;
  byType: {
    single: number;
    series: number;
  };
  bySource: Record<string, number>;
}

export interface CommentStats {
  totalComments: number;
  topMoviesByComments: Array<{
    movieSlug: string;
    count: number;
  }>;
  avgCommentsPerMovie: number;
  repliesCount: number;
}

export interface LikeStats {
  totalLikes: number;
  topLikedComments: Array<{
    commentId: string;
    movieSlug: string;
    likes: number;
    userName: string;
  }>;
  avgLikesPerComment: number;
}

export interface ShareStats {
  totalShares: number;
  topSharedMovies: Array<{
    movieId: string;
    count: number;
  }>;
  sharesBySource: Record<string, number>;
}

export interface WatchlistStats {
  totalAdds: number;
  totalRemoves: number;
  netChange: number;
  topWatchlistedMovies: Array<{
    movieId: string;
    addCount: number;
    removeCount: number;
  }>;
}

export interface CheckInStreakStats {
  userId: string;
  userName: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
}

export interface CheckInHeatmapData {
  date: string;
  count: number;
  users: number;
}

export interface BadgeDistribution {
  badgeId: string;
  badgeName: string;
  totalEarned: number;
  percentage: number;
}

export interface AnalyticsLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  watchSeconds: number;
  watchHours: number;
}

export interface CollectionStats {
  totalCollections: number;
  publicCollections: number;
  privateCollections: number;
  avgItemsPerCollection: number;
  topCollections: Array<{
    collectionId: string;
    name: string;
    itemCount: number;
    userName: string;
  }>;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byCategory: Record<string, number>;
  avgResolutionTimeHours: number | null;
  avgResponseTimeHours: number | null;
}

export interface NotificationStats {
  totalSent: number;
  byType: Record<string, number>;
  avgReadRate: number;
}

export interface DashboardSummary {
  users: {
    total: number;
    newToday: number;
    active7d: number;
  };
  views: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  engagement: {
    todayCheckIns: number;
    totalWatchTimeSeconds: number;
    pendingFeedback: number;
  };
}

export type TimeRange = "24h" | "7d" | "30d" | "90d" | "all";
export type GroupBy = "day" | "week" | "month";
