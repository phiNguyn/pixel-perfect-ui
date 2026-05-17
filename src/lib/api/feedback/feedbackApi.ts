import {
  CreateFeedbackDto,
  Feedback,
  FeedbackStats,
  PaginationInfo,
  FeedbackStatus,
} from "./feedbackInterface";
import { getSessionId } from "@/lib/utils/sessionTracker";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class FeedbackApi {
  private getSessionId(): string {
    return getSessionId();
  }

  /**
   * Submit a new feedback (public endpoint)
   */
  async submit(
    data: CreateFeedbackDto,
    accessToken?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...data,
          sessionId: this.getSessionId(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit feedback");
      }

      return result;
    } catch (error) {
      console.error("Submit feedback error:", error);
      return { success: false, message: "Không thể gửi phản hồi" };
    }
  }

  /**
   * Get paginated feedback list (admin only)
   */
  async getList(
    accessToken: string,
    options: {
      page?: number;
      limit?: number;
      status?: FeedbackStatus;
      category?: string;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<Feedback>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 20));

      if (options.status) {
        params.set("status", options.status);
      }
      if (options.category) {
        params.set("category", options.category);
      }
      if (options.search) {
        params.set("search", options.search);
      }

      const response = await fetch(
        `${API_BASE_URL}/feedback?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback list");
      }

      return response.json();
    } catch (error) {
      console.error("Get feedback list error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Get feedback statistics (admin only)
   */
  async getStats(accessToken: string): Promise<{
    success: boolean;
    data?: FeedbackStats;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      return response.json();
    } catch (error) {
      console.error("Get feedback stats error:", error);
      return { success: false };
    }
  }

  /**
   * Reply to a feedback (admin only)
   */
  async reply(
    feedbackId: string,
    accessToken: string,
    data: {
      status: FeedbackStatus;
      adminReply: string;
      priority?: "low" | "medium" | "high";
    }
  ): Promise<SingleResponse<Feedback>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/feedback/${feedbackId}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reply");
      }

      return response.json();
    } catch (error) {
      console.error("Reply feedback error:", error);
      return { success: false };
    }
  }

  /**
   * Delete a feedback (admin only)
   */
  async delete(
    feedbackId: string,
    accessToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      return response.json();
    } catch (error) {
      console.error("Delete feedback error:", error);
      return { success: false, message: "Không thể xóa" };
    }
  }
}

export const feedbackApi = new FeedbackApi();
