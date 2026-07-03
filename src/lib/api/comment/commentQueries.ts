import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { commentApi, type Comment, type PaginatedComments } from "./commentApi";

export const COMMENT_QUERY_KEY = ["comments"] as const;

const rootListKey = (movieSlug: string) =>
  [...COMMENT_QUERY_KEY, movieSlug, "root"] as const;

const repliesKey = (movieSlug: string, rootId: string) =>
  [...COMMENT_QUERY_KEY, movieSlug, "replies", rootId] as const;

/** Root comments (parentId === null) for a movie, paginated. */
export const useQueryComments = (movieSlug: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...rootListKey(movieSlug), page, limit],
    queryFn: () =>
      commentApi.getComments(movieSlug, { page, limit, parentId: null }),
    enabled: Boolean(movieSlug),
    staleTime: 30_000,
  });
};

/**
 * All replies of a thread (flattened by rootId, oldest first), including
 * reply-to-reply. Lazy: only runs when `enabled` (e.g. the thread is expanded).
 */
export const useQueryReplies = (
  movieSlug: string,
  rootId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: repliesKey(movieSlug, rootId),
    queryFn: () => commentApi.getReplies(movieSlug, rootId),
    enabled: enabled && Boolean(movieSlug) && Boolean(rootId),
    staleTime: 30_000,
  });
};

export interface CreateCommentVariables {
  text: string;
  /** Comment being directly replied to. Omit/null for a root comment. */
  parentId?: string | null;
  /** Top-level comment of the thread (used to refresh the right thread). */
  rootId?: string | null;
}

export const useCreateComment = (movieSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateCommentVariables) =>
      commentApi.createComment({
        movieSlug,
        text: variables.text,
        parentId: variables.parentId ?? null,
      }),
    onSuccess: (response) => {
      const created = response.data;
      const threadRootId = created.rootId ?? created.parentId;

      if (!created.parentId) {
        // New root comment -> refresh the root list.
        queryClient.invalidateQueries({ queryKey: rootListKey(movieSlug) });
        return;
      }

      // New reply -> refresh its thread and the root list (for replyCount).
      if (threadRootId) {
        queryClient.invalidateQueries({
          queryKey: repliesKey(movieSlug, threadRootId),
        });
      }
      queryClient.invalidateQueries({ queryKey: rootListKey(movieSlug) });
    },
  });
};

/** Updates a single comment across every cached comment list for a movie. */
function patchCommentInCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  movieSlug: string,
  commentId: string,
  updater: (comment: Comment) => Comment,
) {
  queryClient.setQueriesData<PaginatedComments>(
    {
      predicate: (query) => {
        const key = query.queryKey as QueryKey;
        return key[0] === "comments" && key[1] === movieSlug;
      },
    },
    (old) => {
      if (!old) return old;
      let changed = false;
      const data = old.data.map((c) => {
        if (c._id !== commentId) return c;
        changed = true;
        return updater(c);
      });
      return changed ? { ...old, data } : old;
    },
  );
}

export const useLikeComment = (movieSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApi.likeComment(commentId),
    onMutate: async (commentId) => {
      patchCommentInCaches(queryClient, movieSlug, commentId, (c) => ({
        ...c,
        likes: c.likes + 1,
      }));
    },
    onSuccess: (response, commentId) => {
      patchCommentInCaches(queryClient, movieSlug, commentId, (c) => ({
        ...c,
        likes: response.data.likes,
      }));
    },
    onError: (_error, commentId) => {
      // Roll back the optimistic increment.
      patchCommentInCaches(queryClient, movieSlug, commentId, (c) => ({
        ...c,
        likes: Math.max(0, c.likes - 1),
      }));
    },
  });
};

export interface DeleteCommentVariables {
  commentId: string;
  /** Thread root, so the correct replies cache is refreshed. */
  rootId?: string | null;
}

export const useDeleteComment = (movieSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeleteCommentVariables) =>
      commentApi.deleteComment(variables.commentId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: rootListKey(movieSlug) });
      if (variables.rootId) {
        queryClient.invalidateQueries({
          queryKey: repliesKey(movieSlug, variables.rootId),
        });
      }
    },
  });
};
