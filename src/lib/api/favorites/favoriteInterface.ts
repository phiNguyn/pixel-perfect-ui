export type FavoriteSource = "ophim" | "phimapi" | "nguonc";

export interface Favorite {
  _id: string;
  userId: string;
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source: FavoriteSource;
  createdAt: string;
  updatedAt: string;
}

export interface AddFavoriteDto {
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster?: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source?: FavoriteSource;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isNew?: boolean;
}
