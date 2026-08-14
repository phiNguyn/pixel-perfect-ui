export type MovieSource = "ophim" | "phimapi" | "nguonc";

export interface CollectionItem {
  _id: string;
  collectionId: string;
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source: string;
  sortOrder: number;
  addedAt: string;
}

export interface Collection {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
}

export interface AddMovieToCollectionDto {
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster?: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source?: string;
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
