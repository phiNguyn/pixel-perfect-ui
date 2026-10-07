import queryString from "query-string";
import {
  UserOverviewStats,
  UserGrowthResult,
  DailyActiveUser,
  RetentionData,
  UserSegmentData,
  TopMovie,
  TrendingMovie,
  ViewSourceStats,
  CompletionRateStats,
  WatchTimeStats,
  DropOffPoint,
  MovieEngagementStats,
  FavoriteStats,
  CommentStats,
  LikeStats,
  ShareStats,
  WatchlistStats,
  CheckInStreakStats,
  CheckInHeatmapData,
  BadgeDistribution,
  AnalyticsLeaderboardEntry,
  CollectionStats,
  FeedbackStats,
  NotificationStats,
  DashboardSummary,
  TimeRange,
  GroupBy,
} from "./analyticsInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class AnalyticsApi {
  /**
   * Get dashboard summary
   */
  async getDashboard(token: string): Promise<{ success: boolean; data?: DashboardSummary }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      return response.json();
    } catch (error) {
      console.error("Get dashboard error:", error);
      return { success: false };
    }
  }

  // ============ USER ANALYTICS ============

  /**
   * Get user overview statistics
   */
  async getUserOverview(token: string): Promise<{ success: boolean; data?: UserOverviewStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/users/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user overview");
      return response.json();
    } catch (error) {
      console.error("Get user overview error:", error);
      return { success: false };
    }
  }

  /**
   * Get user growth over time
   */
  async getUserGrowth(
    token: string,
    options: { range?: TimeRange; groupBy?: GroupBy; startDate?: string; endDate?: string } = {}
  ): Promise<{ success: boolean; data?: UserGrowthResult[] }> {
    try {
      const params = queryString.stringify({
        range: options.range || "30d",
        groupBy: options.groupBy || "day",
        startDate: options.startDate,
        endDate: options.endDate,
      });
      const response = await fetch(`${API_BASE_URL}/analytics/users/growth?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user growth");
      return response.json();
    } catch (error) {
      console.error("Get user growth error:", error);
      return { success: false };
    }
  }

  /**
   * Get Daily/Monthly Active Users
   */
  async getActiveUsers(
    token: string,
    options: { range?: TimeRange; type?: "DAU" | "MAU"; startDate?: string; endDate?: string } = {}
  ): Promise<{ success: boolean; data?: DailyActiveUser[] }> {
    try {
      const params = queryString.stringify({
        range: options.range || "30d",
        type: options.type || "DAU",
        startDate: options.startDate,
        endDate: options.endDate,
      });
      const response = await fetch(`${API_BASE_URL}/analytics/users/active?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch active users");
      return response.json();
    } catch (error) {
      console.error("Get active users error:", error);
      return { success: false };
    }
  }

  /**
   * Get user retention rate
   */
  async getRetention(
    token: string,
    days = 30
  ): Promise<{ success: boolean; data?: RetentionData[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/users/retention?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch retention");
      return response.json();
    } catch (error) {
      console.error("Get retention error:", error);
      return { success: false };
    }
  }

  /**
   * Get user segments
   */
  async getUserSegments(token: string): Promise<{ success: boolean; data?: UserSegmentData[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/users/segments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user segments");
      return response.json();
    } catch (error) {
      console.error("Get user segments error:", error);
      return { success: false };
    }
  }

  // ============ CONTENT ANALYTICS ============

  /**
   * Get top movies
   */
  async getTopMovies(
    token: string,
    options: { limit?: number; range?: TimeRange; metric?: "views" | "unique_viewers" | "watch_time"; startDate?: string; endDate?: string } = {}
  ): Promise<{ success: boolean; data?: TopMovie[] }> {
    try {
      const params = queryString.stringify({
        limit: options.limit || 20,
        range: options.range || "30d",
        metric: options.metric || "views",
        startDate: options.startDate,
        endDate: options.endDate,
      });
      const response = await fetch(`${API_BASE_URL}/analytics/movies/top?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch top movies");
      return response.json();
    } catch (error) {
      console.error("Get top movies error:", error);
      return { success: false };
    }
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(
    token: string,
    options: { limit?: number; range?: TimeRange; startDate?: string; endDate?: string } = {}
  ): Promise<{ success: boolean; data?: TrendingMovie[] }> {
    try {
      const params = queryString.stringify({
        limit: options.limit || 10,
        range: options.range || "7d",
        startDate: options.startDate,
        endDate: options.endDate,
      });
      const response = await fetch(`${API_BASE_URL}/analytics/movies/trending?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch trending movies");
      return response.json();
    } catch (error) {
      console.error("Get trending movies error:", error);
      return { success: false };
    }
  }

  /**
   * Get views by source
   */
  async getViewsBySource(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: ViewSourceStats[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/movies/views-by-source?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch views by source");
      return response.json();
    } catch (error) {
      console.error("Get views by source error:", error);
      return { success: false };
    }
  }

  /**
   * Get completion rate
   */
  async getCompletionRate(
    token: string,
    options: { limit?: number; minViews?: number } = {}
  ): Promise<{ success: boolean; data?: CompletionRateStats[] }> {
    try {
      const params = queryString.stringify({
        limit: options.limit || 20,
        minViews: options.minViews || 10,
      });
      const response = await fetch(
        `${API_BASE_URL}/analytics/movies/completion-rate?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch completion rate");
      return response.json();
    } catch (error) {
      console.error("Get completion rate error:", error);
      return { success: false };
    }
  }

  /**
   * Get watch time stats
   */
  async getWatchTimeStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: WatchTimeStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/movies/watch-time?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch watch time stats");
      return response.json();
    } catch (error) {
      console.error("Get watch time stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get drop-off analysis
   */
  async getDropOffAnalysis(
    token: string,
    options: { movieId?: string; limit?: number } = {}
  ): Promise<{ success: boolean; data?: DropOffPoint[] }> {
    try {
      const params = queryString.stringify({
        movieId: options.movieId,
        limit: options.limit || 10,
      });
      const response = await fetch(
        `${API_BASE_URL}/analytics/movies/drop-off?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch drop-off analysis");
      return response.json();
    } catch (error) {
      console.error("Get drop-off analysis error:", error);
      return { success: false };
    }
  }

  // ============ ENGAGEMENT ANALYTICS ============

  /**
   * Get favorite stats
   */
  async getFavoriteStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: FavoriteStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/engagement/favorites?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch favorite stats");
      return response.json();
    } catch (error) {
      console.error("Get favorite stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get comment stats
   */
  async getCommentStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: CommentStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/engagement/comments?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch comment stats");
      return response.json();
    } catch (error) {
      console.error("Get comment stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get like stats
   */
  async getLikeStats(
    token: string,
    options: { range?: TimeRange; limit?: number } = {}
  ): Promise<{ success: boolean; data?: LikeStats }> {
    try {
      const params = queryString.stringify({
        range: options.range || "30d",
        limit: options.limit || 10,
      });
      const response = await fetch(`${API_BASE_URL}/analytics/engagement/likes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch like stats");
      return response.json();
    } catch (error) {
      console.error("Get like stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get share stats
   */
  async getShareStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: ShareStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/engagement/shares?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch share stats");
      return response.json();
    } catch (error) {
      console.error("Get share stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get watchlist stats
   */
  async getWatchlistStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: WatchlistStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/engagement/watchlist?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch watchlist stats");
      return response.json();
    } catch (error) {
      console.error("Get watchlist stats error:", error);
      return { success: false };
    }
  }

  // ============ GAMIFICATION ANALYTICS ============

  /**
   * Get streak leaderboard
   */
  async getStreakLeaderboard(
    token: string,
    limit = 10
  ): Promise<{ success: boolean; data?: CheckInStreakStats[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/gamification/streak-leaderboard?limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch streak leaderboard");
      return response.json();
    } catch (error) {
      console.error("Get streak leaderboard error:", error);
      return { success: false };
    }
  }

  /**
   * Get check-in heatmap
   */
  async getCheckInHeatmap(
    token: string,
    year: number,
    month: number
  ): Promise<{ success: boolean; data?: CheckInHeatmapData[] }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/gamification/checkin-heatmap?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch check-in heatmap");
      return response.json();
    } catch (error) {
      console.error("Get check-in heatmap error:", error);
      return { success: false };
    }
  }

  /**
   * Get badge distribution
   */
  async getBadgeDistribution(
    token: string
  ): Promise<{ success: boolean; data?: BadgeDistribution[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/gamification/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch badge distribution");
      return response.json();
    } catch (error) {
      console.error("Get badge distribution error:", error);
      return { success: false };
    }
  }

  /**
   * Get watch time leaderboard
   */
  async getWatchTimeLeaderboard(
    token: string,
    options: { period?: "all" | "weekly" | "monthly"; limit?: number } = {}
  ): Promise<{ success: boolean; data?: AnalyticsLeaderboardEntry[] }> {
    try {
      const params = queryString.stringify({
        period: options.period || "all",
        limit: options.limit || 20,
      });
      const response = await fetch(
        `${API_BASE_URL}/analytics/gamification/watchtime-leaderboard?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch watch time leaderboard");
      return response.json();
    } catch (error) {
      console.error("Get watch time leaderboard error:", error);
      return { success: false };
    }
  }

  // ============ OTHER ANALYTICS ============

  /**
   * Get collection stats
   */
  async getCollectionStats(token: string): Promise<{ success: boolean; data?: CollectionStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch collection stats");
      return response.json();
    } catch (error) {
      console.error("Get collection stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get feedback stats
   */
  async getFeedbackStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: FeedbackStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/feedback?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch feedback stats");
      return response.json();
    } catch (error) {
      console.error("Get feedback stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get notification stats
   */
  async getNotificationStats(
    token: string,
    range: TimeRange = "30d"
  ): Promise<{ success: boolean; data?: NotificationStats }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/notifications?range=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch notification stats");
      return response.json();
    } catch (error) {
      console.error("Get notification stats error:", error);
      return { success: false };
    }
  }
}

export const analyticsApi = new AnalyticsApi();
