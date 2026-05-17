import { TrendingMovieResponse } from "./trendingInterface";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class TrendingApi {
  async getTrendingMovies(limit = 10, hoursBack = 24): Promise<TrendingMovieResponse> {
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
}

export const trendingApi = new TrendingApi();
