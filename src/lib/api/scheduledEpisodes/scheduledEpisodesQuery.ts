import { useQuery } from "@tanstack/react-query";
import { scheduledEpisodesApi } from "./scheduledEpisodesApi";

export const useQueryScheduledEpisodes = (slug?: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["scheduled-episodes", slug],
    queryFn: () => scheduledEpisodesApi.getBySlug(slug as string),
    enabled: !!slug && enabled,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
