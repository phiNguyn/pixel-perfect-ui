export type ViewAction = "view" | "complete" | "favorite" | "unfavorite" | "watchlist" | "unwatchlist" | "share";
export type ViewSource = "ophim" | "phimapi" | "nguonc";

export interface CreateViewLogDto {
  movieId: string;
  action: ViewAction;
  source?: ViewSource;
  metadata?: {
    episodeSlug?: string;
    episodeName?: string;
    progress?: number;
    duration?: number;
  };
}

export interface TrendingMovie {
  movieId: string;
  movieTitle?: string;
  moviePoster?: string;
  movieThumb?: string;
  year?: number;
  quality?: string;
  viewCount: number;
  source: ViewSource;
  lastViewed: string;
}

export interface TrendingMovieResponse {
  success: boolean;
  data: TrendingMovie[];
}

export interface MovieStats {
  totalViews: number;
  views24h: number;
  views7d: number;
  favorites: number;
  watchlist: number;
}

export interface MergeResponse {
  success: boolean;
  message: string;
  mergedCount: number;
}
