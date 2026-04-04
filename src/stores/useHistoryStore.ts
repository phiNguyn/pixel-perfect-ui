import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchHistoryItem {
  slug: string;
  name: string;
  thumb_url: string;
  origin_name: string;
  episode_current: string;
  year: number;
  quality: string;
  currentEpSlug: string;
  currentEpName: string;
  currentTime: number;
  duration: number;
  watchedAt: number; // timestamp
  source: "ophim" | "phimapi" | "nguonc";
}

export interface SearchHistoryItem {
  source: "ophim" | "phimapi" | "nguonc";
  slug: string;
  name: string;
  thumb_url: string;
  year: number;
  episode_current: string;
  searchedAt: number;
}

interface HistoryState {
  watchHistory: WatchHistoryItem[];
  searchHistory: SearchHistoryItem[];
  addWatchHistory: (item: WatchHistoryItem) => void;
  updateWatchProgress: (
    slug: string,
    currentTime: number,
    duration: number,
  ) => void;
  removeWatchHistory: (slug: string) => void;
  clearWatchHistory: () => void;
  addSearchHistory: (item: SearchHistoryItem) => void;
  removeSearchHistory: (slug: string) => void;
  clearSearchHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      watchHistory: [],
      searchHistory: [],

      addWatchHistory: (item) =>
        set((state) => {
          const filtered = state.watchHistory.filter(
            (h) => h.slug !== item.slug,
          );
          return { watchHistory: [item, ...filtered].slice(0, 50) };
        }),

      updateWatchProgress: (slug, currentTime, duration) =>
        set((state) => ({
          watchHistory: state.watchHistory.map((h) =>
            h.slug === slug
              ? { ...h, currentTime, duration, watchedAt: Date.now() }
              : h,
          ),
        })),

      removeWatchHistory: (slug) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((h) => h.slug !== slug),
        })),

      clearWatchHistory: () => set({ watchHistory: [] }),

      addSearchHistory: (item) =>
        set((state) => {
          const filtered = state.searchHistory.filter(
            (h) => h.slug !== item.slug,
          );
          return { searchHistory: [item, ...filtered].slice(0, 20) };
        }),

      removeSearchHistory: (slug) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((h) => h.slug !== slug),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: "pinuss-flix-history",
    },
  ),
);
