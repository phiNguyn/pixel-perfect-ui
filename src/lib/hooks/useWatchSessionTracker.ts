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
const HEARTBEAT_SECONDS = HEARTBEAT_INTERVAL_MS / 1000;
// Cap a single flush at heartbeat + small buffer to ignore seeks/pauses.
const MAX_DELTA_PER_FLUSH = HEARTBEAT_SECONDS + 10; // 40s

export function useWatchSessionTracker(options: WatchSessionTrackerOptions) {
  const { isAuthenticated } = useAuth();
  const lastProgressRef = useRef<number | null>(null);
  const lastSentProgressRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const flushSession = useCallback(async (force = false) => {
    if (!isAuthenticated) return;

    const currentProgress = lastProgressRef.current;
    const lastSent = lastSentProgressRef.current;
    if (currentProgress == null || lastSent == null) return;

    const rawDelta = currentProgress - lastSent;

    // Seek backward — reset baseline, don't record negative time.
    if (rawDelta < 0) {
      lastSentProgressRef.current = currentProgress;
      return;
    }

    // Cap delta to ignore seeks forward / long pauses.
    const delta = Math.min(Math.round(rawDelta), MAX_DELTA_PER_FLUSH);

    if (delta <= 0) return;
    if (!force && delta < 5) return;

    const opts = optionsRef.current;
    if (!opts.movieId || !opts.episodeSlug) return;

    const progressStart = lastSent;
    const progressEnd = currentProgress;
    // Optimistically advance baseline so concurrent flushes don't double-count.
    lastSentProgressRef.current = currentProgress;

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
        progressStart,
        progressEnd,
      });
    } catch {
      // Rollback baseline so we retry on next heartbeat.
      lastSentProgressRef.current = progressStart;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.currentTime === "number") {
        // Initialize baseline on first time-update so we don't treat the
        // initial player time (e.g. resume position) as watched seconds.
        if (lastSentProgressRef.current == null) {
          lastSentProgressRef.current = detail.currentTime;
        }
        lastProgressRef.current = detail.currentTime;
      }
    };

    window.addEventListener("player-time-update", handleTimeUpdate);
    return () => window.removeEventListener("player-time-update", handleTimeUpdate);
  }, []);

  useEffect(() => {
    lastProgressRef.current = null;
    lastSentProgressRef.current = null;

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
