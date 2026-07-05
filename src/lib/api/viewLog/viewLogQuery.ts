import { useQuery } from "@tanstack/react-query";
import { viewLogApi } from "./viewLogApi";

export const useQueryMovieViewCount = (movieId: string, enabled = true) => {
  return useQuery({
    queryKey: ["view-logs", "view-count", movieId],
    enabled: enabled && !!movieId,
    queryFn: async () => {
      const response = await viewLogApi.getMovieStats(movieId);
      return response.data?.viewCount ?? 0;
    },
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
