import { useQuery } from "@tanstack/react-query";
import { moviesApi, MoviesApi } from "./movieApi";
import { QueryResult } from "@/hooks/useQueryResult";

export const useQueryMovies = (
  query: QueryResult,
  enabled = true,
  key = "movies",
  slug: string,
) => {
  return useQuery({
    queryKey: [key, JSON.stringify(query)],
    queryFn: () => moviesApi.findAll(query, slug),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useQueryMovie = (id?: string) => {
  return useQuery({
    queryKey: ["movie", id],
    enabled: !!id,
    queryFn: () => moviesApi.findOne(id as string),
  });
};
