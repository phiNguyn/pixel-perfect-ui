import axios, { AxiosInstance } from "axios";
import type {
  ScheduledEpisode,
  ScheduledEpisodesResponse,
} from "./scheduledEpisodesInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ScheduledEpisodesApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getBySlug(slug: string): Promise<ScheduledEpisode[]> {
    const response = await this.client.get<ScheduledEpisodesResponse>(
      "/movies/scheduled-episodes",
      { params: { slug } },
    );
    return response.data.data ?? [];
  }
}

export const scheduledEpisodesApi = new ScheduledEpisodesApiClient(
  API_BASE_URL,
);
