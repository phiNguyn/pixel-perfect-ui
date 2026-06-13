export interface CalendarDaySummary {
  date: string;
  totalWatchSeconds: number;
  totalWatchHours: number;
  movieCount: number;
}

export interface CalendarMonthData {
  year: number;
  month: number;
  activeDays: CalendarDaySummary[];
  monthTotalWatchSeconds: number;
  monthTotalWatchHours: number;
}

export interface CalendarDayEpisode {
  episodeSlug: string;
  episodeName: string | null;
  watchedSeconds: number;
  watchedHours: number;
  sessions: number;
}

export interface CalendarDayMovie {
  movieId: string;
  movieTitle: string;
  moviePoster: string | null;
  source: string;
  totalWatchSeconds: number;
  totalWatchHours: number;
  episodes: CalendarDayEpisode[];
}

export interface CalendarDayData {
  date: string;
  formattedDate: string;
  totalWatchSeconds: number;
  totalWatchHours: number;
  movies: CalendarDayMovie[];
}
