import { useQuery } from "@tanstack/react-query";
import { viewLogApi } from "../viewLog/viewLogApi";
import { TrendingMovie } from "../viewLog/viewLogInterface";

export const useQueryTrendingMovies = (slug, limit = 10, enabled = true) => {
  return useQuery<TrendingMovie[]>({
    queryKey: ["trending", "view-logs", slug],
    enabled,

    queryFn: async () => {
      const response = await viewLogApi.getTrendingMovies(limit);
      return response.data || [];
    },

    staleTime: Infinity,
    gcTime: Infinity,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
};
