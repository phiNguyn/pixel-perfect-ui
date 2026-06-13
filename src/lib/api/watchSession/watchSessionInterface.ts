import type { WatchHistorySource } from "@/lib/api/watchHistoryApi";

export interface RecordWatchSessionDto {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  originName?: string;
  year?: number;
  source?: WatchHistorySource;
  episodeSlug: string;
  episodeName?: string;
  watchedSeconds: number;
  progressStart?: number;
  progressEnd?: number;
  timezone?: string;
}

export interface WatchSessionRecord {
  id: string;
  movieId: string;
  episodeSlug: string;
  watchedSeconds: number;
  watchDate: string;
  endedAt: string;
}

export interface UserWatchStats {
  totalWatchSeconds: number;
  totalWatchHours: number;
  weeklyWatchSeconds: number;
  weeklyWatchHours: number;
  monthlyWatchSeconds: number;
  monthlyWatchHours: number;
  lastWatchedAt: string | null;
}
