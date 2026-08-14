"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "./collectionApi";
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddMovieToCollectionDto,
} from "./collectionInterface";
import { useAuthStore } from "@/stores/useAuthStore";

export const COLLECTIONS_QUERY_KEY = "collections";

function getAccessToken(): string | undefined {
  return useAuthStore.getState().tokens?.accessToken;
}

export function useCollections(options?: { page?: number; limit?: number }) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [COLLECTIONS_QUERY_KEY, options],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.getList(token, options);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollection(collectionId: string) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [COLLECTIONS_QUERY_KEY, collectionId],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.getById(token, collectionId);
    },
    enabled: !!accessToken && !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionDto) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.create(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: UpdateCollectionDto;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.update(token, collectionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId],
      });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.delete(token, collectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
    },
  });
}

export function useAddMovieToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: AddMovieToCollectionDto;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.addMovie(token, collectionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId],
      });
      queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
    },
  });
}

export function useRemoveMovieFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      movieId,
      source,
    }: {
      collectionId: string;
      movieId: string;
      source?: string;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.removeMovie(token, collectionId, movieId, source);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId],
      });
      queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
    },
  });
}

export function useReorderCollectionMovies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      orderedMovieIds,
    }: {
      collectionId: string;
      orderedMovieIds: string[];
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.reorderMovies(token, collectionId, orderedMovieIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId],
      });
    },
  });
}

export function useRemovedMovies(collectionId: string) {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: [COLLECTIONS_QUERY_KEY, collectionId, "removed"],
    queryFn: () => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.getRemovedMovies(token, collectionId);
    },
    enabled: !!accessToken && !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRestoreMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      movieId,
      source,
    }: {
      collectionId: string;
      movieId: string;
      source?: string;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return collectionsApi.restoreMovie(token, collectionId, movieId, source);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId],
      });
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, variables.collectionId, "removed"],
      });
    },
  });
}
