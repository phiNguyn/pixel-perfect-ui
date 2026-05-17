"use client";

import { useCallback } from "react";
import { viewLogApi } from "@/lib/api/viewLog/viewLogApi";
import { ViewAction, ViewSource } from "@/lib/api/viewLog/viewLogInterface";

interface TrackViewOptions {
  movieId: string;
  source?: ViewSource;
  episodeSlug?: string;
  episodeName?: string;
  action?: ViewAction;
}

interface UseTrackMovieViewReturn {
  trackView: (options: TrackViewOptions) => void;
  isTracking: boolean;
}

/**
 * Hook to track movie view events
 * Call this when user clicks to watch a movie
 */
export function useTrackMovieView(): UseTrackMovieViewReturn {
  const trackView = useCallback(
    async (options: TrackViewOptions) => {
      const { movieId, source = "ophim", action = "view", episodeSlug, episodeName } = options;

      // Fire and forget - don't block UI
      viewLogApi
        .logView({
          movieId,
          action,
          source,
          metadata: {
            episodeSlug,
            episodeName,
          },
        })
        .catch((error) => {
          console.error("Failed to track view:", error);
        });
    },
    []
  );

  return { trackView, isTracking: false };
}

/**
 * Utility function to track movie view without hook
 * Use this in event handlers
 */
export function trackMovieView(options: TrackViewOptions): void {
  const { movieId, source = "ophim", action = "view", episodeSlug, episodeName } = options;

  viewLogApi.logView({
    movieId,
    action,
    source,
    metadata: {
      episodeSlug,
      episodeName,
    },
  }).catch((error) => {
    console.error("Failed to track view:", error);
  });
}
