import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type BadgeTier = "bronze" | "silver" | "gold" | "special";

export interface StreakBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  earnedAt: string | null;
  unlocked: boolean;
}

export interface StreakProfile {
  totalActiveDays: number;
  checkedInToday: boolean;
  todayDate: string;
  checkInDates: string[];
  badges: StreakBadge[];
  newlyUnlockedBadges: StreakBadge[];
}

export interface CheckInResult extends StreakProfile {
  isNewCheckIn: boolean;
}

class StreakApiClient {
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
    if (StreakApiClient.interceptorAdded) return;
    StreakApiClient.interceptorAdded = true;

    this.client.interceptors.request.use((config) => {
      const authHeader = getAuthHeader();
      if (authHeader) config.headers.Authorization = authHeader;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      createAuthInterceptor(),
    );
  }

  async checkIn(): Promise<CheckInResult> {
    const response = await this.client.post<{
      success: boolean;
      data: CheckInResult;
    }>("/streak/check-in");
    return response.data.data;
  }

  async getProfile(): Promise<StreakProfile> {
    const response = await this.client.get<{
      success: boolean;
      data: StreakProfile;
    }>("/streak/me");
    return response.data.data;
  }

  async getMonthCalendar(year: number, month: number): Promise<string[]> {
    const response = await this.client.get<{
      success: boolean;
      data: { dates: string[] };
    }>("/streak/calendar", { params: { year, month } });
    return response.data.data.dates;
  }
}

export const streakApi = new StreakApiClient(API_BASE_URL);
