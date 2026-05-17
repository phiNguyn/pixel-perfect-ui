import axios, { AxiosInstance } from "axios";
import {
  getAuthHeader,
  createAuthInterceptor,
  getTokens,
  saveTokens,
  clearTokens,
  type AuthTokens,
} from "@/lib/auth/tokenManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
    role: "user" | "admin";
    provider: "local" | "google";
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  role: "user" | "admin";
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
    if (AuthApiClient.interceptorAdded) return;
    AuthApiClient.interceptorAdded = true;

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

  async googleAuth(googleToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/google", {
      token: googleToken,
    });
    const data = response.data;

    // Save tokens
    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data;
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
    const data = response.data;

    // Save tokens
    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const data = response.data;

    // Save tokens
    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.client.post<{ accessToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout");
    } finally {
      clearTokens();
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>("/users/me");
    return response.data;
  }

  async updateProfile(data: { name?: string; username?: string; avatar?: string | null }): Promise<UserProfile> {
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
