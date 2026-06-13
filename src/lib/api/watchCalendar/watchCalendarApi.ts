import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";
import type { CalendarDayData, CalendarMonthData } from "./watchCalendarInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class WatchCalendarApiClient {
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
    if (WatchCalendarApiClient.interceptorAdded) return;
    WatchCalendarApiClient.interceptorAdded = true;

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

  async getMonthOverview(year: number, month: number): Promise<CalendarMonthData> {
    const response = await this.client.get<{ success: boolean; data: CalendarMonthData }>(
      "/watch-calendar",
      { params: { year, month } },
    );
    return response.data.data;
  }

  async getDayDetail(date: string): Promise<CalendarDayData> {
    const response = await this.client.get<{ success: boolean; data: CalendarDayData }>(
      `/watch-calendar/${date}`,
    );
    return response.data.data;
  }
}

export const watchCalendarApi = new WatchCalendarApiClient(API_BASE_URL);
