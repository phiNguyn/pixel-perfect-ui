import { getAuthHeader } from "@/lib/auth/tokenManager";
import type {
  LeaderboardData,
  LeaderboardPeriod,
  MyRankData,
} from "./leaderboardInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class LeaderboardApi {
  async getLeaderboard(
    period: LeaderboardPeriod = "all",
    page = 1,
    limit = 50,
  ): Promise<LeaderboardData> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const params = new URLSearchParams({
      period,
      page: String(page),
      limit: String(limit),
    });

    const response = await fetch(`${API_BASE_URL}/leaderboard?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    const json = await response.json();
    return json.data;
  }

  async getMyRank(period: LeaderboardPeriod = "all"): Promise<MyRankData> {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({ period });
    const response = await fetch(`${API_BASE_URL}/leaderboard/me?${params}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch rank");
    }

    const json = await response.json();
    return json.data;
  }
}

export const leaderboardApi = new LeaderboardApi();
