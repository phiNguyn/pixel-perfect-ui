import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  currentServerName: string;
  currentTime: number;
  duration: number;
  watchedAt: number; // timestamp
}

export interface SearchHistoryItem {
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
  updateWatchProgress: (slug: string, currentTime: number, duration: number) => void;
  removeWatchHistory: (slug: string) => void;
  clearWatchHistory: () => void;
  addSearchHistory: (item: SearchHistoryItem) => void;
  removeSearchHistory: (slug: string) => void;
  clearSearchHistory: () => void;
}

// Read fresh store state synchronously — bypasses React stale closure issues
export const getWatchHistory = () => useHistoryStore.getState().watchHistory;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      watchHistory: [],
      searchHistory: [],

      addWatchHistory: (item) =>
        set((state) => {
          // One entry per movie — switching server updates in-place, preserves currentTime
          const filtered = state.watchHistory.filter((h) => h.slug !== item.slug);
          return { watchHistory: [item, ...filtered].slice(0, 50) };
        }),

      updateWatchProgress: (slug, currentTime, duration) =>
        set((state) => ({
          watchHistory: state.watchHistory.map((h) =>
            h.slug === slug ? { ...h, currentTime, duration, watchedAt: Date.now() } : h
          ),
        })),

      removeWatchHistory: (slug: string) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((h) => h.slug !== slug),
        })),

      clearWatchHistory: () => set({ watchHistory: [] }),

      addSearchHistory: (item) =>
        set((state) => {
          const filtered = state.searchHistory.filter((h) => h.slug !== item.slug);
          return { searchHistory: [item, ...filtered].slice(0, 20) };
        }),

      removeSearchHistory: (slug) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((h) => h.slug !== slug),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'pinuss-flix-history',
    }
  )
);
