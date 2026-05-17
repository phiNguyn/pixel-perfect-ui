import { Movie } from "@/lib/api/movies/movieInterface";

export interface RecommendationResponse {
  status: boolean;
  message: string;
  data: {
    items: RecommendationItem[];
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface RecommendationItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: string;
  thumb_url: string;
  poster_url: string;
  sub_docquyen: boolean;
  chieurap: boolean;
  time: string;
  episode_current: string;
  quality: string;
  lang: string;
  year: number;
  category: Category[];
  country: Country[];
  tmdb: TMDB;
  modified: Modified;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface TMDB {
  type: string;
  id: string;
  season: number | null;
  vote_average: number;
  vote_count: number;
}

export interface Modified {
  time: string;
}

export interface MovieRecommendation extends Movie {
  recommendationType?: "same-category" | "same-country" | "same-actor" | "trending";
}
