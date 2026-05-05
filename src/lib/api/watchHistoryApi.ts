import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type WatchHistorySource = "ophim" | "phimapi" | "nguonc";

export interface WatchHistoryResponse {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  // Additional movie info
  originName?: string;
  episodeCurrent?: string;
  year?: number;
  quality?: string;
  // Progress info
  progress: number;
  duration: number;
  completed: boolean;
  // Episode info
  currentEpSlug?: string;
  currentEpName?: string;
  // Source
  source: WatchHistorySource;
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
  private static interceptorAdded = false;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptors only once
    this.setupInterceptors();
  }

  private setupInterceptors() {
    if (WatchHistoryApiClient.interceptorAdded) return;
    WatchHistoryApiClient.interceptorAdded = true;

    // Request interceptor - add auth header
    this.client.interceptors.request.use((config) => {
      const authHeader = getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
      return config;
    });

    // Response interceptor - handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      createAuthInterceptor()
    );
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
    originName?: string;
    episodeCurrent?: string;
    year?: number;
    quality?: string;
    progress: number;
    duration: number;
    completed?: boolean;
    currentEpSlug?: string;
    currentEpName?: string;
    source?: WatchHistorySource;
  }): Promise<WatchHistoryResponse> {
    const response = await this.client.post<WatchHistoryResponse>(
      "/watch-history",
      data
    );
    return response.data;
  }

  async bulkCreateWatchHistory(items: Array<{
    movieId: string;
    movieTitle: string;
    moviePoster?: string;
    originName?: string;
    episodeCurrent?: string;
    year?: number;
    quality?: string;
    progress: number;
    duration: number;
    completed?: boolean;
    currentEpSlug?: string;
    currentEpName?: string;
    source?: WatchHistorySource;
  }>): Promise<{ insertedCount: number; upsertedCount: number }> {
    const response = await this.client.post<{ insertedCount: number; upsertedCount: number }>(
      "/watch-history/bulk",
      { items }
    );
    return response.data;
  }

  async updateWatchHistory(
    movieId: string,
    data: {
      progress?: number;
      duration?: number;
      completed?: boolean;
      movieTitle?: string;
      moviePoster?: string;
      originName?: string;
      episodeCurrent?: string;
      year?: number;
      quality?: string;
      currentEpSlug?: string;
      currentEpName?: string;
      source?: WatchHistorySource;
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

  async restoreWatchHistory(movieId: string): Promise<WatchHistoryResponse> {
    const response = await this.client.post<WatchHistoryResponse>(
      `/watch-history/restore/${movieId}`
    );
    return response.data;
  }

  async deleteAllWatchHistory(): Promise<{ deletedCount: number }> {
    const response = await this.client.delete<{ deletedCount: number }>(
      "/watch-history"
    );
    return response.data;
  }
}

export const watchHistoryApi = new WatchHistoryApiClient(API_BASE_URL);
