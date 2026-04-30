import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface WatchHistoryResponse {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  progress: number;
  duration: number;
  completed: boolean;
  watchedAt: string;
}

export interface PaginatedWatchHistory {
  data: WatchHistoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class WatchHistoryApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const tokens = localStorage.getItem("pinuss-flix-auth");
        if (tokens) {
          try {
            const parsed = JSON.parse(tokens);
            const accessToken = parsed?.state?.tokens?.accessToken;
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
      return config;
    });
  }

  async getWatchHistory(
    page = 1,
    limit = 20
  ): Promise<PaginatedWatchHistory> {
    const response = await this.client.get<PaginatedWatchHistory>(
      "/watch-history",
      { params: { page, limit } }
    );
    return response.data;
  }

  async getRecentWatchHistory(limit = 10): Promise<WatchHistoryResponse[]> {
    const response = await this.client.get<{ data: WatchHistoryResponse[] }>(
      "/watch-history/recent",
      { params: { limit } }
    );
    return response.data.data;
  }

  async getContinueWatching(limit = 10): Promise<WatchHistoryResponse[]> {
    const response = await this.client.get<{ data: WatchHistoryResponse[] }>(
      "/watch-history/continue",
      { params: { limit } }
    );
    return response.data.data;
  }

  async getWatchHistoryByMovie(movieId: string): Promise<WatchHistoryResponse | null> {
    try {
      const response = await this.client.get<WatchHistoryResponse>(
        `/watch-history/${movieId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async createWatchHistory(data: {
    movieId: string;
    movieTitle: string;
    moviePoster?: string;
    progress: number;
    duration: number;
    completed?: boolean;
  }): Promise<WatchHistoryResponse> {
    const response = await this.client.post<WatchHistoryResponse>(
      "/watch-history",
      data
    );
    return response.data;
  }

  async updateWatchHistory(
    movieId: string,
    data: {
      progress?: number;
      duration?: number;
      completed?: boolean;
    }
  ): Promise<WatchHistoryResponse> {
    const response = await this.client.patch<WatchHistoryResponse>(
      `/watch-history/${movieId}`,
      data
    );
    return response.data;
  }

  async deleteWatchHistory(movieId: string): Promise<void> {
    await this.client.delete(`/watch-history/${movieId}`);
  }

  async deleteAllWatchHistory(): Promise<{ deletedCount: number }> {
    const response = await this.client.delete<{ deletedCount: number }>(
      "/watch-history"
    );
    return response.data;
  }
}

export const watchHistoryApi = new WatchHistoryApiClient(API_BASE_URL);
