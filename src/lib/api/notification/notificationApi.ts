import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type NotificationType =
  | "comment_reply"
  | "leaderboard_overtake"
  | "rank_change"
  | "system"
  | "event";

export interface NotificationMetadata {
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  movieSlug?: string;
  movieTitle?: string;
  commentId?: string;
  parentCommentId?: string;
  rank?: number;
  previousRank?: number;
  eventId?: string;
}

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: NotificationMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class NotificationApiClient {
  private client: AxiosInstance;
  private static interceptorAdded = false;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    if (NotificationApiClient.interceptorAdded) return;
    NotificationApiClient.interceptorAdded = true;

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

  async getNotifications(
    page = 1,
    limit = 20,
    unreadOnly = false,
  ): Promise<PaginatedNotifications> {
    const response = await this.client.get<PaginatedNotifications>(
      "/notifications",
      { params: { page, limit, unreadOnly } },
    );
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.client.get<{
      success: boolean;
      data: { count: number };
    }>("/notifications/unread-count");
    return response.data.data.count;
  }

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await this.client.patch<{
      success: boolean;
      data: NotificationItem;
    }>(`/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllAsRead(): Promise<number> {
    const response = await this.client.patch<{
      success: boolean;
      data: { modifiedCount: number };
    }>("/notifications/read-all");
    return response.data.data.modifiedCount;
  }
}

export const notificationApi = new NotificationApiClient(API_BASE_URL);
