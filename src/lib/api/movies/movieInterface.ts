export enum MovieCategory {
  PHIM_MOI = "phim-moi",
  PHIM_BO = "phim-bo",
  PHIM_LE = "phim-le",
  TV_SHOWS = "tv-shows",
  HOAT_HINH = "hoat-hinh",
  PHIM_VIETSUB = "phim-vietsub",
  PHIM_THUYET_MINH = "phim-thuyet-minh",
  PHIM_LONG_TIEN = "phim-long-tien",
  PHIM_BO_DANG_CHIEU = "phim-bo-dang-chieu",
  PHIM_BO_HOAN_THANH = "phim-bo-hoan-thanh",
  PHIM_SAP_CHIEU = "phim-sap-chieu",
  SUBTEAM = "subteam",
  PHIM_CHIEU_RAP = "phim-chieu-rap",
}

export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  alternative_names: string[];

  type: string;

  thumb_url: string;
  poster_url: string;

  sub_docquyen: boolean;
  chieurap: boolean;

  time: string;
  episode_current: string;

  quality: string;
  lang: string;
  lang_key: string[];

  year: number;

  category: Category[];
  country: Country[];
  last_episodes: LastEpisode[];

  tmdb: TMDB;
  imdb: IMDB;
  modified: Modified;
}

export interface SearchMovie extends Movie {
  source: "ophim" | "phimapi";
}

export interface TMDB {
  type: string;
  id: string;
  season: number | null;
  vote_average: number;
  vote_count: number;
}

export interface IMDB {
  id: string;
  vote_average: number;
  vote_count: number;
}

export interface Modified {
  time: string;
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

export interface LastEpisode {
  server_name: string;
  is_ai: boolean;
  name: string;
}

export interface IMovieDetail {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  alternative_names: string[];

  content: string;

  type: string;
  status: string;

  thumb_url: string;
  poster_url: string;

  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;

  trailer_url: string;

  time: string;
  episode_current: string;
  episode_total: string;

  quality: string;
  lang: string;
  lang_key: string[];

  notify: string;
  showtimes: string;

  year: number;
  view: number;

  actor: string[];
  director: string[];

  category: Category[];
  country: Country[];

  tmdb?: TMDB;
  imdb?: IMDB;

  created: TimeObject;
  modified: TimeObject;

  episodes: EpisodeServer[];
}
export interface TMDB {
  type: string;
  id: string;
  season: number | null;
  vote_average: number;
  vote_count: number;
}

export interface IMDB {
  id: string;
  vote_average: number;
  vote_count: number;
}

export interface TimeObject {
  time: string;
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

export interface EpisodeServer {
  server_name: string;
  is_ai: boolean;
  server_data: Episode[];
}

export interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface PhimApiEpisode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface PhimApiEpisodeServer {
  server_name: string;
  is_ai: boolean;
  server_data: PhimApiEpisode[];
}

export interface PhimApiMovie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  poster_url: string;
  thumb_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: Category[];
  country: Country[];
  episodes: PhimApiEpisodeServer[];
}

export function convertPhimApiToIMovieDetail(data: any): IMovieDetail {
  const { movie: phimApiMovie, episodes } = data;

  return {
    _id: phimApiMovie._id,
    name: phimApiMovie.name,
    slug: phimApiMovie.slug,
    origin_name: phimApiMovie.origin_name,
    alternative_names: [],
    content: phimApiMovie.content,
    type: phimApiMovie.type,
    status: phimApiMovie.status,
    thumb_url: phimApiMovie.thumb_url,
    poster_url: phimApiMovie.poster_url,
    is_copyright: phimApiMovie.is_copyright,
    sub_docquyen: phimApiMovie.sub_docquyen,
    chieurap: phimApiMovie.chieurap,
    trailer_url: phimApiMovie.trailer_url,
    time: phimApiMovie.time,
    episode_current: phimApiMovie.episode_current,
    episode_total: phimApiMovie.episode_total,
    quality: phimApiMovie.quality,
    lang: phimApiMovie.lang,
    lang_key: [],
    notify: phimApiMovie.notify,
    showtimes: phimApiMovie.showtimes,
    year: phimApiMovie.year,
    view: phimApiMovie.view,
    actor: phimApiMovie.actor,
    director: phimApiMovie.director,
    category: phimApiMovie.category,
    country: phimApiMovie.country,
    tmdb: {
      type: null as any,
      id: null as any,
      season: null,
      vote_average: 0,
      vote_count: 0,
    },
    imdb: { id: null as any, vote_average: 0, vote_count: 0 },
    created: { time: new Date().toISOString() },
    modified: { time: new Date().toISOString() },
    episodes: episodes.map((server) => ({
      server_name: server.server_name,
      is_ai: server.is_ai,
      server_data: server.server_data.map((ep) => ({
        name: ep.name,
        slug: ep.slug,
        filename: ep.filename,
        link_embed: ep.link_embed,
        link_m3u8: ep.link_m3u8,
      })),
    })),
  };
}
