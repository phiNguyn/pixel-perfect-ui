import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    provider: "local" | "google";
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: "local" | "google";
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchHistoryItem {
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
  data: WatchHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AuthApiClient {
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

  async googleAuth(googleToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/google", {
      token: googleToken,
    });
    return response.data;
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.client.post<{ accessToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>("/users/me");
    return response.data;
  }

  async updateProfile(data: { name?: string; avatar?: string | null }): Promise<UserProfile> {
    const response = await this.client.patch<UserProfile>("/users/me", data);
    return response.data;
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

  async createWatchHistory(data: {
    movieId: string;
    movieTitle: string;
    moviePoster?: string;
    progress: number;
    duration: number;
    completed?: boolean;
  }): Promise<WatchHistoryItem> {
    const response = await this.client.post<WatchHistoryItem>(
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
  ): Promise<WatchHistoryItem> {
    const response = await this.client.patch<WatchHistoryItem>(
      `/watch-history/${movieId}`,
      data
    );
    return response.data;
  }

  async getWatchHistoryByMovie(movieId: string): Promise<WatchHistoryItem | null> {
    try {
      const response = await this.client.get<WatchHistoryItem>(
        `/watch-history/${movieId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async getRecentWatchHistory(limit = 10): Promise<WatchHistoryItem[]> {
    const response = await this.client.get<{ data: WatchHistoryItem[] }>(
      "/watch-history/recent",
      { params: { limit } }
    );
    return response.data.data;
  }

  async getContinueWatching(limit = 10): Promise<WatchHistoryItem[]> {
    const response = await this.client.get<{ data: WatchHistoryItem[] }>(
      "/watch-history/continue",
      { params: { limit } }
    );
    return response.data.data;
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

export const authApi = new AuthApiClient(API_BASE_URL);
