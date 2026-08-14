import axios from "axios";
import {
  Collection,
  CollectionWithItems,
  CreateCollectionDto,
  UpdateCollectionDto,
  AddMovieToCollectionDto,
  CollectionItem,
  PaginatedResponse,
  SingleResponse,
} from "./collectionInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class CollectionsApi {
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
    } = {}
  ): Promise<PaginatedResponse<Collection>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/collections`, {
        ...this.getConfig(accessToken),
        params: { page: options.page || 1, limit: options.limit || 20 },
      });
      return response.data;
    } catch (error) {
      console.error("Get collections error:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  }

  async getById(
    accessToken: string,
    collectionId: string
  ): Promise<{ success: boolean; data?: CollectionWithItems }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/collections/${collectionId}`,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Get collection error:", error);
      return { success: false };
    }
  }

  async create(
    accessToken: string,
    data: CreateCollectionDto
  ): Promise<SingleResponse<Collection>> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/collections`,
        data,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Create collection error:", error);
      return { success: false, message: "Không thể tạo bộ sưu tập" };
    }
  }

  async update(
    accessToken: string,
    collectionId: string,
    data: UpdateCollectionDto
  ): Promise<SingleResponse<Collection>> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/collections/${collectionId}`,
        data,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Update collection error:", error);
      return { success: false, message: "Không thể cập nhật bộ sưu tập" };
    }
  }

  async delete(
    accessToken: string,
    collectionId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/collections/${collectionId}`,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Delete collection error:", error);
      return { success: false, message: "Không thể xóa bộ sưu tập" };
    }
  }

  async addMovie(
    accessToken: string,
    collectionId: string,
    data: AddMovieToCollectionDto
  ): Promise<{
    success: boolean;
    isNew?: boolean;
    restored?: boolean;
    data?: CollectionItem;
    message?: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/collections/${collectionId}/movies`,
        data,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Add movie to collection error:", error);
      return { success: false, message: "Không thể thêm phim vào bộ sưu tập" };
    }
  }

  async getRemovedMovies(
    accessToken: string,
    collectionId: string
  ): Promise<{ success: boolean; data?: CollectionItem[] }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/collections/${collectionId}/removed-movies`,
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Get removed movies error:", error);
      return { success: false };
    }
  }

  async restoreMovie(
    accessToken: string,
    collectionId: string,
    movieId: string,
    source?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/collections/${collectionId}/restore-movie/${movieId}`,
        { source },
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Restore movie error:", error);
      return {
        success: false,
        message: "Không thể khôi phục phim",
      };
    }
  }

  async removeMovie(
    accessToken: string,
    collectionId: string,
    movieId: string,
    source?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/collections/${collectionId}/movies/${movieId}`,
        { action: "remove", source },
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Remove movie from collection error:", error);
      return {
        success: false,
        message: "Không thể xóa phim khỏi bộ sưu tập",
      };
    }
  }

  async reorderMovies(
    accessToken: string,
    collectionId: string,
    orderedMovieIds: string[]
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/collections/${collectionId}/reorder`,
        { orderedMovieIds },
        this.getConfig(accessToken)
      );
      return response.data;
    } catch (error) {
      console.error("Reorder movies error:", error);
      return {
        success: false,
        message: "Không thể sắp xếp lại phim",
      };
    }
  }

  async checkMovieInCollection(
    accessToken: string,
    collectionId: string,
    movieId: string,
    source?: string
  ): Promise<{
    success: boolean;
    data?: { isInCollection: boolean; collectionNames: string[] };
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/collections/${collectionId}/check-movie`,
        {
          ...this.getConfig(accessToken),
          params: { movieId, source },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Check movie in collection error:", error);
      return { success: false };
    }
  }
}

export const collectionsApi = new CollectionsApi();
