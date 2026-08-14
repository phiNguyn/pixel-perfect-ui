import { QueryResult } from "@/hooks/useQueryResult";
import {
  AdminUser,
  AdminStats,
  WatchHistoryItem,
  Comment,
  PaginatedResponse,
  SingleResponse,
  PaginationInfo,
  TodayCheckIn,
} from "./adminInterface";
import type { StreakProfile } from "@/lib/api/streak/streakApi";
import type {
  CalendarDayData,
  CalendarMonthData,
} from "@/lib/api/watchCalendar/watchCalendarInterface";
import queryString from "query-string";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class AdminApi {
  /**
   * Get admin dashboard statistics
   */
  async getStats(
    accessToken: string,
  ): Promise<{ success: boolean; data?: AdminStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      return response.json();
    } catch (error) {
      console.error("Get admin stats error:", error);
      return { success: false };
    }
  }

  /**
   * Get paginated user list
   */
  async getUsers(
    accessToken: string,
    query: QueryResult,
  ): Promise<PaginatedResponse<AdminUser> & { pagination: PaginationInfo }> {
    try {
      const stringified = queryString.stringify(query, {
        skipNull: true,
        skipEmptyString: true,
      });

      const response = await fetch(
        `${API_BASE_URL}/admin/users?${stringified}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    } catch (error) {
      console.error("Get users error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Get user detail
   */
  async getUserDetail(
    userId: string,
    accessToken: string,
  ): Promise<SingleResponse<AdminUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      return response.json();
    } catch (error) {
      console.error("Get user detail error:", error);
      return { success: false };
    }
  }

  /**
   * Get user's watch history (including deleted)
   */
  async getUserWatchHistory(
    userId: string,
    accessToken: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<WatchHistoryItem>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 20));

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/watch-history?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch watch history");
      }

      return response.json();
    } catch (error) {
      console.error("Get watch history error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Get user's streak profile
   */
  async getUserStreak(
    userId: string,
    accessToken: string,
  ): Promise<SingleResponse<StreakProfile>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/streak`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user streak");
      }

      return response.json();
    } catch (error) {
      console.error("Get user streak error:", error);
      return { success: false };
    }
  }

  /**
   * Get user's streak calendar for a month
   */
  async getUserStreakCalendar(
    userId: string,
    accessToken: string,
    year: number,
    month: number,
  ): Promise<SingleResponse<{ year: number; month: number; dates: string[] }>> {
    try {
      const params = new URLSearchParams();
      params.set("year", String(year));
      params.set("month", String(month));

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/streak/calendar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user streak calendar");
      }

      return response.json();
    } catch (error) {
      console.error("Get user streak calendar error:", error);
      return { success: false };
    }
  }

  /**
   * Get user's watch calendar month overview
   */
  async getUserWatchCalendarMonth(
    userId: string,
    accessToken: string,
    year: number,
    month: number,
  ): Promise<SingleResponse<CalendarMonthData>> {
    try {
      const params = new URLSearchParams();
      params.set("year", String(year));
      params.set("month", String(month));

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/watch-calendar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user watch calendar");
      }

      return response.json();
    } catch (error) {
      console.error("Get user watch calendar error:", error);
      return { success: false };
    }
  }

  /**
   * Get user's watch calendar day detail
   */
  async getUserWatchCalendarDay(
    userId: string,
    accessToken: string,
    date: string,
  ): Promise<SingleResponse<CalendarDayData>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/watch-calendar/${date}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user watch calendar day");
      }

      return response.json();
    } catch (error) {
      console.error("Get user watch calendar day error:", error);
      return { success: false };
    }
  }

  /**
   * Get all comments
   */
  async getComments(
    accessToken: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      movieSlug?: string;
    } = {},
  ): Promise<PaginatedResponse<Comment>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 20));

      if (options.userId) params.set("userId", options.userId);
      if (options.movieSlug) params.set("movieSlug", options.movieSlug);

      const response = await fetch(
        `${API_BASE_URL}/admin/comments?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return response.json();
    } catch (error) {
      console.error("Get comments error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: string,
    accessToken: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return response.json();
    } catch (error) {
      console.error("Delete comment error:", error);
      return { success: false, message: "Không thể xóa bình luận" };
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    role: "user" | "admin",
    accessToken: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ userId, role }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      return response.json();
    } catch (error) {
      console.error("Update role error:", error);
      return { success: false, message: "Không thể cập nhật vai trò" };
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(
    userId: string,
    isActive: boolean,
    accessToken: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ isActive }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      return response.json();
    } catch (error) {
      console.error("Toggle status error:", error);
      return { success: false, message: "Không thể thay đổi trạng thái" };
    }
  }

  /**
   * Get today's check-ins ranked by time (earliest first)
   */
  async getTodayCheckIns(
    accessToken: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<TodayCheckIn>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 50));

      const response = await fetch(
        `${API_BASE_URL}/admin/check-ins/today?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch today's check-ins");
      }

      return response.json();
    } catch (error) {
      console.error("Get today check-ins error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      };
    }
  }
}

export const adminApi = new AdminApi();
