export interface ScheduledEpisode {
  episode: string;
  air_date: string;
}

export interface ScheduledEpisodesResponse {
  success: boolean;
  data: ScheduledEpisode[];
}
