import { useQuery } from "@tanstack/react-query";
import { thiaPhimApi } from "./thia-phim.api";

export const useQueryThiaPhimHot = (enabled = true, key = "thia-phim") => {
  return useQuery({
    queryKey: [key],
    queryFn: () => thiaPhimApi.findAll(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
