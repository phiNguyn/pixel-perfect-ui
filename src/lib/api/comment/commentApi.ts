import axios, { AxiosInstance } from "axios";
import { getAuthHeader, createAuthInterceptor } from "@/lib/auth/tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface Comment {
  _id: string;
  movieSlug: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes: number;
  // Comment being directly replied to (null for root comments).
  parentId: string | null;
  // Top-level comment of the whole thread (null for root comments).
  rootId?: string | null;
  // Denormalized name of the user being directly replied to (for "@name").
  replyToUserName?: string | null;
  isDeleted: boolean;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedComments {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCommentResponse {
  success: boolean;
  data: Comment;
}

export interface LikeCommentResponse {
  success: boolean;
  data: { likes: number };
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

class CommentApiClient {
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
    if (CommentApiClient.interceptorAdded) return;
    CommentApiClient.interceptorAdded = true;

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

  async getComments(
    movieSlug: string,
    options: {
      page?: number;
      limit?: number;
      parentId?: string | null;
      rootId?: string;
    } = {},
  ): Promise<PaginatedComments> {
    const { page = 1, limit = 20, parentId, rootId } = options;

    const params: Record<string, string | number> = { page, limit };
    if (rootId) {
      // Fetch the whole flattened thread of a top-level comment.
      params.rootId = rootId;
    } else if (parentId !== undefined) {
      params.parentId = parentId === null ? "null" : parentId;
    }

    const response = await this.client.get<PaginatedComments>(
      `/comments/movie/${encodeURIComponent(movieSlug)}`,
      { params },
    );
    return response.data;
  }

  async getReplies(
    movieSlug: string,
    rootId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedComments> {
    return this.getComments(movieSlug, {
      ...options,
      rootId,
      limit: options.limit ?? 100,
    });
  }

  async createComment(data: {
    movieSlug: string;
    text: string;
    parentId?: string | null;
  }): Promise<CreateCommentResponse> {
    const response = await this.client.post<CreateCommentResponse>(
      "/comments",
      data,
    );
    return response.data;
  }

  async likeComment(commentId: string): Promise<LikeCommentResponse> {
    const response = await this.client.post<LikeCommentResponse>(
      `/comments/${commentId}/like`,
    );
    return response.data;
  }

  async deleteComment(commentId: string): Promise<DeleteCommentResponse> {
    const response = await this.client.delete<DeleteCommentResponse>(
      `/comments/${commentId}`,
    );
    return response.data;
  }
}

export const commentApi = new CommentApiClient(API_BASE_URL);
