import axios from "axios";
import {
  Favorite,
  AddFavoriteDto,
  PaginatedResponse,
  SingleResponse,
  FavoriteSource,
} from "./favoriteInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class FavoritesApi {
  private getConfig(accessToken: string) {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  async getList(
    accessToken: string,
    options: {
      page?: number;
      limit?: number;
      source?: FavoriteSource;
    } = {}
  ): Promise<PaginatedResponse<Favorite>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        ...this.getConfig(accessToken),
        params: {
          page: options.page || 1,
          limit: options.limit || 20,
          source: options.source,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get favorites error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  async add(
    accessToken: string,
    data: AddFavoriteDto
  ): Promise<SingleResponse<Favorite>> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites`,
        data,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Add favorite error:", error);
      return { success: false, message: "Không thể thêm vào yêu thích" };
    }
  }

  async remove(
    accessToken: string,
    movieId: string,
    source?: FavoriteSource
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/favorites/${movieId}`,
        { action: "remove", source },
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Remove favorite error:", error);
      return { success: false, message: "Không thể xóa khỏi yêu thích" };
    }
  }

  async check(
    accessToken: string,
    movieId: string,
    source?: FavoriteSource
  ): Promise<{ success: boolean; isFavorited: boolean }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/${movieId}/check`,
        {
          ...this.getConfig(accessToken),
          params: { source },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Check favorite error:", error);
      return { success: false, isFavorited: false };
    }
  }

  async bulkCheck(
    accessToken: string,
    movieIds: string[],
    source?: FavoriteSource
  ): Promise<{ success: boolean; data?: { favoritedIds: string[] } }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites/bulk-check`,
        { movieIds, source },
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Bulk check favorites error:", error);
      return { success: false };
    }
  }

  async getCount(
    accessToken: string
  ): Promise<{ success: boolean; data?: { count: number } }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/count`,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Get favorite count error:", error);
      return { success: false };
    }
  }
}

export const favoritesApi = new FavoritesApi();
