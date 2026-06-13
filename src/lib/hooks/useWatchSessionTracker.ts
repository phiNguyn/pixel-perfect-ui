"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { watchSessionApi } from "@/lib/api/watchSession/watchSessionApi";
import type { WatchHistorySource } from "@/lib/api/watchHistoryApi";

interface WatchSessionTrackerOptions {
  enabled: boolean;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  originName?: string;
  year?: number;
  source?: WatchHistorySource;
  episodeSlug: string;
  episodeName?: string;
}

const HEARTBEAT_INTERVAL_MS = 30_000;

export function useWatchSessionTracker(options: WatchSessionTrackerOptions) {
  const { isAuthenticated } = useAuth();
  const lastProgressRef = useRef(0);
  const lastSentProgressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const flushSession = useCallback(async (force = false) => {
    if (!isAuthenticated) return;

    const currentProgress = lastProgressRef.current;
    const delta = Math.round(currentProgress - lastSentProgressRef.current);

    if (delta <= 0 || delta > 120) return;
    if (!force && delta < 5) return;

    const opts = optionsRef.current;
    if (!opts.movieId || !opts.episodeSlug) return;

    try {
      await watchSessionApi.recordSession({
        movieId: opts.movieId,
        movieTitle: opts.movieTitle,
        moviePoster: opts.moviePoster,
        originName: opts.originName,
        year: opts.year,
        source: opts.source ?? "ophim",
        episodeSlug: opts.episodeSlug,
        episodeName: opts.episodeName,
        watchedSeconds: delta,
        progressStart: lastSentProgressRef.current,
        progressEnd: currentProgress,
      });
      lastSentProgressRef.current = currentProgress;
    } catch {
      // Silent fail — watch time tracking is non-critical
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.currentTime === "number") {
        lastProgressRef.current = detail.currentTime;
      }
    };

    window.addEventListener("player-time-update", handleTimeUpdate);
    return () => window.removeEventListener("player-time-update", handleTimeUpdate);
  }, []);

  useEffect(() => {
    lastProgressRef.current = 0;
    lastSentProgressRef.current = 0;

    if (!options.enabled || !isAuthenticated) return;

    intervalRef.current = setInterval(() => {
      void flushSession();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      void flushSession(true);
    };
  }, [
    options.enabled,
    options.episodeSlug,
    options.movieId,
    isAuthenticated,
    flushSession,
  ]);
}
