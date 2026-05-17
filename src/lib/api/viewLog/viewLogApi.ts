import {
  CreateViewLogDto,
  TrendingMovieResponse,
  MovieStats,
  MergeResponse,
} from "./viewLogInterface";
import { getSessionId } from "@/lib/utils/sessionTracker";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class ViewLogApi {
  private getSessionId(): string {
    return getSessionId();
  }

  /**
   * Log a view event (for both anonymous and logged in users)
   * This should be called when user clicks to watch a movie
   */
  async logView(
    data: CreateViewLogDto,
    accessToken?: string
  ): Promise<{ success: boolean }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/view-logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...data,
          sessionId: this.getSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log view");
      }

      return response.json();
    } catch (error) {
      console.error("Failed to log view:", error);
      return { success: false };
    }
  }

  /**
   * Get trending movies (public endpoint)
   */
  async getTrendingMovies(
    limit = 10,
    hoursBack = 24
  ): Promise<TrendingMovieResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/view-logs/trending?limit=${limit}&hoursBack=${hoursBack}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trending movies");
      }

      return response.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * Get movie statistics
   */
  async getMovieStats(movieId: string): Promise<{
    success: boolean;
    data?: MovieStats;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/view-logs/stats/${movieId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie stats");
      }

      return response.json();
    } catch {
      return { success: false };
    }
  }

  /**
   * Merge anonymous session to user account (called after login)
   */
  async mergeSession(
    sessionId: string,
    accessToken: string
  ): Promise<MergeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/view-logs/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to merge session");
      }

      return response.json();
    } catch {
      return { success: false, message: "Failed to merge session", mergedCount: 0 };
    }
  }

  /**
   * Get user view history (requires auth)
   */
  async getUserHistory(
    accessToken: string,
    page = 1,
    limit = 20
  ): Promise<{ success: boolean; data?: any[]; pagination?: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/view-logs/history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      return response.json();
    } catch {
      return { success: false };
    }
  }
}

export const viewLogApi = new ViewLogApi();
