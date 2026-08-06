/**
 * Google Analytics 4 utility for Pinuss Flix
 *
 * Provides centralized tracking functions for:
 * - Page views
 * - Movie interactions (play, pause, watch time)
 * - Search behavior
 * - Filter usage
 * - User engagement metrics
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type GtagCommand = "event" | "config" | "set" | "get";

interface MovieEventParams {
  movie_id: string;
  movie_title: string;
  movie_slug: string;
  source: string;
}

interface SearchEventParams {
  search_term: string;
  result_count: number;
  source: string;
}

interface FilterEventParams {
  filter_type: "category" | "country" | "year" | "sort_lang";
  filter_value: string;
  action: "add" | "remove";
}

interface VideoEventParams extends MovieEventParams {
  episode_slug?: string;
  episode_name?: string;
  playback_speed?: number;
  quality?: string;
  watch_time_seconds?: number;
  watch_time_percent?: number;
}

interface UserActionParams {
  action_type: string;
  element_name?: string;
  page_url?: string;
}

class Analytics {
  private isInitialized = false;

  private gtag(command: GtagCommand, ...args: unknown[]): void {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag(command, ...args);
    }
  }

  /**
   * Track page view
   */
  pageView(url: string, title: string): void {
    this.gtag("event", "page_view", {
      page_location: url,
      page_title: title,
    });
  }

  /**
   * Track movie detail view
   */
  movieView(params: MovieEventParams): void {
    this.gtag("event", "movie_view", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
    });
  }

  /**
   * Track when user starts playing a movie/episode
   */
  moviePlay(params: VideoEventParams): void {
    this.gtag("event", "movie_play", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      episode_slug: params.episode_slug,
      episode_name: params.episode_name,
    });
  }

  /**
   * Track when user pauses the video
   */
  moviePause(
    params: VideoEventParams & { pause_position_seconds: number },
  ): void {
    this.gtag("event", "movie_pause", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      episode_slug: params.episode_slug,
      pause_position_seconds: params.pause_position_seconds,
    });
  }

  /**
   * Track video seek events
   */
  movieSeek(
    params: VideoEventParams & {
      seek_from_seconds: number;
      seek_to_seconds: number;
    },
  ): void {
    this.gtag("event", "movie_seek", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      seek_from_seconds: params.seek_from_seconds,
      seek_to_seconds: params.seek_to_seconds,
    });
  }

  /**
   * Track episode change
   */
  episodeChange(
    params: VideoEventParams & { from_episode: string; to_episode: string },
  ): void {
    this.gtag("event", "episode_change", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      from_episode: params.from_episode,
      to_episode: params.to_episode,
    });
  }

  /**
   * Track when user completes watching an episode (>90% watched)
   */
  movieComplete(params: VideoEventParams): void {
    this.gtag("event", "movie_complete", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      episode_slug: params.episode_slug,
      episode_name: params.episode_name,
      watch_time_seconds: params.watch_time_seconds,
    });
  }

  /**
   * Track watch time progress (every milestone)
   */
  watchProgress(
    params: VideoEventParams & { milestone: "25%" | "50%" | "75%" | "90%" },
  ): void {
    this.gtag("event", "watch_progress", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      episode_slug: params.episode_slug,
      milestone: params.milestone,
      watch_time_seconds: params.watch_time_seconds,
    });
  }

  /**
   * Track search queries
   */
  search(params: SearchEventParams): void {
    this.gtag("event", "search", {
      search_term: params.search_term,
      result_count: params.result_count,
      source: params.source,
    });
  }

  /**
   * Track search with no results
   */
  searchNoResults(params: Omit<SearchEventParams, "result_count">): void {
    this.gtag("event", "search_no_results", {
      search_term: params.search_term,
      source: params.source,
    });
  }

  /**
   * Track filter usage
   */
  filter(params: FilterEventParams): void {
    this.gtag("event", "filter_applied", {
      filter_type: params.filter_type,
      filter_value: params.filter_value,
      action: params.action,
    });
  }

  /**
   * Track filter clear
   */
  filterClear(): void {
    this.gtag("event", "filter_cleared", {});
  }

  /**
   * Track movie card click
   */
  movieClick(
    params: MovieEventParams & { position: number; list_name?: string },
  ): void {
    this.gtag("event", "movie_click", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      source: params.source,
      position: params.position,
      list_name: params.list_name,
    });
  }

  /**
   * Track share action
   */
  share(
    params: MovieEventParams & { share_method: "native" | "copy_link" },
  ): void {
    this.gtag("event", "share", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      share_method: params.share_method,
    });
  }

  /**
   * Track trailer view
   */
  trailerView(params: MovieEventParams): void {
    this.gtag("event", "trailer_view", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
    });
  }

  /**
   * Track quality change
   */
  qualityChange(
    params: VideoEventParams & {
      new_quality: string;
      auto_or_manual: "auto" | "manual";
    },
  ): void {
    this.gtag("event", "quality_change", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      new_quality: params.new_quality,
      auto_or_manual: params.auto_or_manual,
    });
  }

  /**
   * Track playback speed change
   */
  speedChange(params: VideoEventParams & { new_speed: number }): void {
    this.gtag("event", "playback_speed_change", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      new_speed: params.new_speed,
    });
  }

  /**
   * Track fullscreen toggle
   */
  fullscreenToggle(
    params: VideoEventParams & { is_fullscreen: boolean },
  ): void {
    this.gtag("event", "fullscreen_toggle", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      is_fullscreen: params.is_fullscreen,
    });
  }

  /**
   * Track PiP (Picture in Picture) toggle
   */
  pipToggle(params: VideoEventParams & { is_pip: boolean }): void {
    this.gtag("event", "pip_toggle", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
      is_pip: params.is_pip,
    });
  }

  /**
   * Track user login attempt
   */
  loginAttempt(params: {
    method: "email" | "google" | "github";
    success: boolean;
  }): void {
    this.gtag("event", "login_attempt", {
      login_method: params.method,
      login_success: params.success,
    });
  }

  /**
   * Track comment submission
   */
  commentSubmit(params: MovieEventParams & { comment_length: number }): void {
    this.gtag("event", "comment_submit", {
      movie_id: params.movie_id,
      movie_slug: params.movie_slug,
      comment_length: params.comment_length,
    });
  }

  /**
   * Track video ad skip
   */
  adSkip(params: MovieEventParams): void {
    this.gtag("event", "ad_skipped", {
      movie_id: params.movie_id,
      movie_title: params.movie_title,
      movie_slug: params.movie_slug,
    });
  }

  /**
   * Track custom user action
   */
  customEvent(name: string, params?: Record<string, unknown>): void {
    this.gtag("event", name, params);
  }
}

export const analytics = new Analytics();

export type {
  MovieEventParams,
  SearchEventParams,
  FilterEventParams,
  VideoEventParams,
  UserActionParams,
};
