"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "./favoriteApi";
import { AddFavoriteDto, FavoriteSource } from "./favoriteInterface";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCallback } from "react";

export const FAVORITES_QUERY_KEY = "favorites";

function getAccessToken(): string | undefined {
  return useAuthStore.getState().tokens?.accessToken;
}

export function useFavorites(options?: {
  page?: number;
  limit?: number;
  source?: FavoriteSource;
}) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, options],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.getList(token, options);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFavoriteCount() {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, "count"],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.getCount(token);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckFavorite(movieId: string, source?: FavoriteSource) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, "check", movieId, source],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.check(token, movieId, source);
    },
    enabled: !!accessToken && !!movieId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBulkCheckFavorites(
  movieIds: string[],
  source?: FavoriteSource
) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, "bulk-check", movieIds, source],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.bulkCheck(token, movieIds, source);
    },
    enabled: !!accessToken && movieIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFavoriteDto) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.add(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      movieId,
      source,
    }: {
      movieId: string;
      source?: FavoriteSource;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return favoritesApi.remove(token, movieId, source);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
}

export function useToggleFavorite() {
  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();

  const toggle = useCallback(
    async (data: AddFavoriteDto) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const checkResult = await favoritesApi.check(
        token,
        data.movieId,
        data.source
      );

      if (checkResult.isFavorited) {
        return removeMutation.mutateAsync({
          movieId: data.movieId,
          source: data.source,
        });
      } else {
        return addMutation.mutateAsync(data);
      }
    },
    [addMutation, removeMutation]
  );

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
