import {
  AdminUser,
  AdminStats,
  WatchHistoryItem,
  Comment,
  PaginatedResponse,
  SingleResponse,
  PaginationInfo,
} from "./adminInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class AdminApi {
  /**
   * Get admin dashboard statistics
   */
  async getStats(accessToken: string): Promise<{ success: boolean; data?: AdminStats }> {
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
    options: {
      page?: number;
      limit?: number;
      search?: string;
      role?: "user" | "admin";
      isActive?: boolean;
    } = {}
  ): Promise<PaginatedResponse<AdminUser> & { pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 20));

      if (options.search) params.set("search", options.search);
      if (options.role) params.set("role", options.role);
      if (typeof options.isActive === "boolean") {
        params.set("isActive", String(options.isActive));
      }

      const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
    accessToken: string
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
    options: { page?: number; limit?: number } = {}
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
        }
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
   * Get all comments
   */
  async getComments(
    accessToken: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      movieSlug?: string;
    } = {}
  ): Promise<PaginatedResponse<Comment>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(options.page || 1));
      params.set("limit", String(options.limit || 20));

      if (options.userId) params.set("userId", options.userId);
      if (options.movieSlug) params.set("movieSlug", options.movieSlug);

      const response = await fetch(`${API_BASE_URL}/admin/comments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
    accessToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
    accessToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, role }),
      });

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
    accessToken: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      return response.json();
    } catch (error) {
      console.error("Toggle status error:", error);
      return { success: false, message: "Không thể thay đổi trạng thái" };
    }
  }
}

export const adminApi = new AdminApi();
