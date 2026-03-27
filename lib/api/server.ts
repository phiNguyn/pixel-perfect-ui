import { IMovieDetail } from "./movies/movieInterface";

const BASE_URL = "https://ophim1.com/v1/api";

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  data: {
    seoOnPage: {
      titleHead: string;
      descriptionHead: string;
      og_type: string;
      og_image: string[];
      og_url: string;
      seoSchema: Record<string, unknown>;
    };
    breadCrumb: Array<{
      name: string;
      slug?: string;
      isCurrent: boolean;
      position: number;
    }>;
    item: IMovieDetail;
  };
}

export interface MoviesListResponse {
  status: boolean;
  msg: string;
  data: {
    titlePage: string;
    type_list: string;
    breadCrumb: Array<{
      name: string;
      slug?: string;
      isCurrent: boolean;
      position: number;
    }>;
    items: Array<{
      _id: string;
      name: string;
      slug: string;
      origin_name: string;
      thumb_url: string;
      poster_url: string;
      year: number;
      quality: string;
      lang: string;
      episode_current: string;
      category: Array<{ id: string; name: string; slug: string }>;
      country: Array<{ id: string; name: string; slug: string }>;
      tmdb: { vote_average: number };
    }>;
    params: {
      pagination: {
        currentPage: number;
        totalItems: number;
        totalItemsPerPage: number;
      };
    };
  };
}

export async function fetchMovieDetail(
  slug: string
): Promise<MovieDetailResponse> {
  const res = await fetch(`${BASE_URL}/phim/${slug}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch movie: ${slug}`);
  }

  return res.json();
}

export async function fetchMoviesList(
  type: string,
  slug: string,
  params: Record<string, string | number> = {}
): Promise<MoviesListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = `${BASE_URL}/${type}/${slug}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch movies list: ${type}/${slug}`);
  }

  return res.json();
}

export async function fetchMoviesByCategory(
  type: string,
  slug: string,
  page: number = 1
): Promise<{
  items?: Array<{
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    thumb_url: string;
    poster_url: string;
    year: number;
    quality: string;
    lang: string;
    episode_current: string;
    category: Array<{ id: string; name: string; slug: string }>;
    country: Array<{ id: string; name: string; slug: string }>;
    tmdb: { vote_average: number };
  }>;
  params?: {
    pagination: {
      currentPage: number;
      totalItems: number;
      totalItemsPerPage: number;
    };
  };
  titlePage?: string;
  breadCrumb?: Array<{
    name: string;
    slug?: string;
    isCurrent: boolean;
    position: number;
  }>;
} | null> {
  try {
    const url = `${BASE_URL}/${type}/${slug}?page=${page}`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching movies by category:", error);
    return null;
  }
}
