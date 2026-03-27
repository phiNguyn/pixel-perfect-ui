import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { moviesApi } from "./movieApi";
import { QueryResult } from "@/hooks/useQueryResult";

export const useQueryMovies = <TData = unknown>(
  query: QueryResult,
  enabled = true,
  key = "movies",
  slug: string,
  isKeepData = false,
) => {
  return useQuery<TData>({
    queryKey: [key, JSON.stringify(query), slug],
    queryFn: () => moviesApi.findAll<TData>(query, slug),
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

export const useQuerySearchMovie = <TData = unknown>(q: string) => {
  return useQuery<TData>({
    queryKey: ["movies", q],
    enabled: !!q,
    queryFn: () => moviesApi.searchMovie<TData>(q as string),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
