import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { moviesApi, MoviesApi } from "./movieApi";
import { QueryResult } from "@/hooks/useQueryResult";

export const useQueryMovies = (
  query: QueryResult,
  enabled = true,
  key = "movies",
  slug: string,
  isKeepData = false,
) => {
  return useQuery({
    queryKey: [key, JSON.stringify(query), slug],
    queryFn: () => moviesApi.findAll(query, slug),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: isKeepData ? keepPreviousData : undefined,
  });
};

export const useQueryMovie = (id?: string, peoples?: string) => {
  return useQuery({
    queryKey: ["movie", id, peoples],
    enabled: !!id,
    queryFn: () => moviesApi.findOne(id as string, peoples),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuerySearchMovie = (q: string) => {
  return useQuery({
    queryKey: ["movies", q],
    enabled: !!q,
    queryFn: () => moviesApi.searchMovie(q as string),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
