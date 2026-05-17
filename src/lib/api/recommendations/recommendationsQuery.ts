import { useQuery } from "@tanstack/react-query";
import { recommendationsApi } from "./recommendationsApi";
import { RecommendationItem } from "./recommendationsInterface";

export const useQueryRecommendationsByCategory = (
  categorySlug: string,
  excludeSlug?: string,
  limit = 12,
  enabled = true
) => {
  return useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "category", categorySlug, excludeSlug],
    enabled: !!categorySlug && enabled,
    queryFn: () =>
      recommendationsApi.getByCategory(categorySlug, limit, excludeSlug),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useQueryRecommendationsByCountry = (
  countrySlug: string,
  excludeSlug?: string,
  limit = 8,
  enabled = true
) => {
  return useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "country", countrySlug, excludeSlug],
    enabled: !!countrySlug && enabled,
    queryFn: () =>
      recommendationsApi.getByCountry(countrySlug, limit, excludeSlug),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useQueryTrendingMovies = (limit = 10, enabled = true) => {
  return useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "trending", limit],
    enabled,
    queryFn: () => recommendationsApi.getTrending(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useQueryRecommendationsByActor = (
  actorName: string,
  excludeSlug?: string,
  limit = 6,
  enabled = true
) => {
  return useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "actor", actorName, excludeSlug],
    enabled: !!actorName && enabled,
    queryFn: () =>
      recommendationsApi.getByActor(actorName, limit, excludeSlug),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useQueryHomeRecommendations = (limit = 12, enabled = true) => {
  return useQuery<{
    trending: RecommendationItem[];
    new: RecommendationItem[];
    series: RecommendationItem[];
  }>({
    queryKey: ["recommendations", "home", limit],
    enabled,
    queryFn: () => recommendationsApi.getHome(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
