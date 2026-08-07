/* eslint-disable @typescript-eslint/no-explicit any */

import { BaseApi } from "@/lib/client";
import {
  Category,
  Country,
  IMovieDetail,
} from "@/lib/api/movies/movieInterface";

export interface NguoncMovie {
  id: string;
  name: string;
  slug: string;
  original_name: string;
  thumb_url: string;
  poster_url: string;
  created: string;
  modified: string;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  director: string;
  casts: string;
}

export interface NguoncSearchResponse {
  status: string;
  paginate: {
    current_page: number;
    total_page: number;
    total_items: number;
    items_per_page: number;
  };
  items: NguoncMovie[];
}

export interface NguoncEpisodeItem {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
}

export interface NguoncEpisodeServer {
  server_name: string;
  items: NguoncEpisodeItem[];
}

export interface NguoncMovieDetailResponse {
  status: string;
  movie: NguoncMovieDetail;
}

export interface NguoncMovieDetail extends NguoncMovie {
  category: Record<
    string,
    {
      group: { id: string; name: string };
      list: { id: string; name: string }[];
    }
  >;
  episodes: NguoncEpisodeServer[];
}

export class NguoncApi extends BaseApi {
  constructor() {
    super("https://phim.nguonc.com/api/");
  }
  async getMovie(link: string) {
    return this.get(`film/${link}`);
  }
  async searchMovie(value: string) {
    return this.get(`films/search?keyword=${value}&limit=10`);
  }
}

export const nguoncApi = new NguoncApi();

export function convertNguoncToMovie(item: NguoncMovie) {
  return {
    _id: item.id,
    name: item.name,
    slug: item.slug,
    origin_name: item.original_name,
    alternative_names: [],

    type: "movie",
    thumb_url: item.thumb_url,
    poster_url: item.poster_url,

    sub_docquyen: false,
    chieurap: false,

    time: item.time,
    episode_current: item.current_episode,

    quality: item.quality,
    lang: item.language,
    lang_key: [],

    year: 0,
    category: [],
    country: [],
    last_episodes: [],

    tmdb: {
      type: "",
      id: "",
      season: null,
      vote_average: 0,
      vote_count: 0,
    },
    imdb: {
      id: "",
      vote_average: 0,
      vote_count: 0,
    },
    modified: {
      time: item.modified,
    },
  };
}

export function convertNguoncDetailToIMovieDetail(
  data: NguoncMovieDetail,
): IMovieDetail {
  const allCategories: Category[] = [];
  const allCountries: Category[] = [];

  Object.values(data.category).forEach((group) => {
    const groupName = group.group.name.toLowerCase();
    if (groupName.includes("quốc gia") || groupName.includes("quoc gia")) {
      allCountries.push(
        ...group.list.map((item) => ({
          id: item.id,
          name: item.name,
          slug: "",
        })),
      );
    } else if (groupName.includes("năm") || groupName.includes("nam")) {
      // year will be extracted separately
    } else {
      allCategories.push(
        ...group.list.map((item) => ({
          id: item.id,
          name: item.name,
          slug: "",
        })),
      );
    }
  });

  const yearEntry = Object.values(data.category).find((group) =>
    group.group.name.toLowerCase().includes("năm"),
  )?.list[0]?.name;

  const year = yearEntry ? parseInt(yearEntry) : null;

  return {
    _id: data.id,
    name: data.name,
    slug: data.slug,
    origin_name: data.original_name,
    alternative_names: [],

    content: data.description,
    type: "movie",
    status: "",

    thumb_url: data.thumb_url,
    poster_url: data.poster_url,

    is_copyright: false,
    sub_docquyen: false,
    chieurap: false,

    trailer_url: "",

    time: data.time,
    episode_current: data.current_episode,
    episode_total: String(data.total_episodes),

    quality: data.quality,
    lang: data.language,
    lang_key: [],

    notify: "",
    showtimes: "",

    year,
    view: 0,

    actor: data.casts ? data.casts.split(",").map((s) => s.trim()) : [],
    director: data.director ? [data.director] : [],

    category: allCategories,
    country: allCountries,

    tmdb: {
      type: "",
      id: "",
      season: null,
      vote_average: 0,
      vote_count: 0,
    },
    imdb: {
      id: "",
      vote_average: 0,
      vote_count: 0,
    },
    created: { time: data.created },
    modified: { time: data.modified },

    episodes: data.episodes.map((server) => ({
      server_name: server.server_name,
      is_ai: false,
      server_data: server.items.map((ep) => ({
        name: ep.name,
        slug: ep.slug,
        filename: ep.slug,
        link_embed: ep.embed,
        link_m3u8: ep.m3u8,
      })),
    })),
  };
}
