import { apiClient } from "@/lib/client";
import {
  RecommendationResponse,
  RecommendationItem,
} from "./recommendationsInterface";

export class RecommendationsApi {
  private baseURL = "https://ophim1.com/v1/api/";

  async getByCategory(
    categorySlug: string,
    limit = 12,
    excludeSlug?: string
  ): Promise<RecommendationItem[]> {
    try {
      const response = await apiClient.get<RecommendationResponse>(
        `${this.baseURL}the-loai/${categorySlug}?limit=${limit}`
      );
      let items = response.data?.data?.items || [];

      if (excludeSlug) {
        items = items.filter((item) => item.slug !== excludeSlug);
      }

      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  async getByCountry(
    countrySlug: string,
    limit = 8,
    excludeSlug?: string
  ): Promise<RecommendationItem[]> {
    try {
      const response = await apiClient.get<RecommendationResponse>(
        `${this.baseURL}quoc-gia/${countrySlug}?limit=${limit}`
      );
      let items = response.data?.data?.items || [];

      if (excludeSlug) {
        items = items.filter((item) => item.slug !== excludeSlug);
      }

      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  async getTrending(limit = 10): Promise<RecommendationItem[]> {
    try {
      const response = await apiClient.get<RecommendationResponse>(
        `${this.baseURL}danh-sach/phim-hot?limit=${limit}`
      );
      return response.data?.data?.items || [];
    } catch {
      return [];
    }
  }

  async getByActor(
    actorName: string,
    limit = 6,
    excludeSlug?: string
  ): Promise<RecommendationItem[]> {
    try {
      const response = await apiClient.get<RecommendationResponse>(
        `${this.baseURL}tim-kiem?keyword=${encodeURIComponent(actorName)}&limit=${limit}`
      );
      let items = response.data?.data?.items || [];

      if (excludeSlug) {
        items = items.filter((item) => item.slug !== excludeSlug);
      }

      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  async getHome(limit = 12): Promise<{
    trending: RecommendationItem[];
    new: RecommendationItem[];
    series: RecommendationItem[];
  }> {
    try {
      const [trendingRes, newRes, seriesRes] = await Promise.all([
        apiClient.get<RecommendationResponse>(
          `${this.baseURL}danh-sach/phim-hot?limit=${limit}`
        ),
        apiClient.get<RecommendationResponse>(
          `${this.baseURL}danh-sach/phim-moi?limit=${limit}`
        ),
        apiClient.get<RecommendationResponse>(
          `${this.baseURL}danh-sach/phim-bo?limit=${limit}`
        ),
      ]);

      return {
        trending: trendingRes.data?.data?.items || [],
        new: newRes.data?.data?.items || [],
        series: seriesRes.data?.data?.items || [],
      };
    } catch {
      return { trending: [], new: [], series: [] };
    }
  }
}

export const recommendationsApi = new RecommendationsApi();
