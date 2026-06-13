import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";
import type {
  RecordWatchSessionDto,
  UserWatchStats,
  WatchSessionRecord,
} from "./watchSessionInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class WatchSessionApiClient {
  private client: AxiosInstance;
  private static interceptorAdded = false;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    if (WatchSessionApiClient.interceptorAdded) return;
    WatchSessionApiClient.interceptorAdded = true;

    this.client.interceptors.request.use((config) => {
      const authHeader = getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      createAuthInterceptor(),
    );
  }

  async recordSession(
    data: RecordWatchSessionDto,
  ): Promise<WatchSessionRecord> {
    const response = await this.client.post<{ success: boolean; data: WatchSessionRecord }>(
      "/watch-sessions",
      {
        ...data,
        timezone:
          data.timezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    );
    return response.data.data;
  }

  async getMyStats(): Promise<UserWatchStats> {
    const response = await this.client.get<{ success: boolean; data: UserWatchStats }>(
      "/watch-sessions/stats/me",
    );
    return response.data.data;
  }
}

export const watchSessionApi = new WatchSessionApiClient(API_BASE_URL);
