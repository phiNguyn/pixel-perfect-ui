import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { watchHistoryApi, type WatchHistoryResponse } from "@/lib/api/watchHistoryApi";

export interface WatchHistoryItem {
  id: string;
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
  watchedAt: number;
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
  isSyncing: boolean;
  lastSyncedAt: number | null;
  addWatchHistory: (item: Omit<WatchHistoryItem, "id" | "watchedAt" | "currentTime">) => Promise<void>;
  updateWatchProgress: (
    slug: string,
    currentTime: number,
    duration: number,
  ) => Promise<void>;
  removeWatchHistory: (slug: string) => Promise<void>;
  clearWatchHistory: () => Promise<void>;
  addSearchHistory: (item: SearchHistoryItem) => void;
  removeSearchHistory: (slug: string) => void;
  clearSearchHistory: () => void;
  syncFromDatabase: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
}

// Convert local format to database format
function toDbFormat(item: WatchHistoryItem) {
  return {
    movieId: item.slug,
    movieTitle: item.name,
    moviePoster: item.thumb_url,
    progress: item.currentTime,
    duration: item.duration,
    completed: item.duration > 0 && item.currentTime >= item.duration * 0.9,
  };
}

// Convert database format to local format
function fromDbFormat(item: WatchHistoryResponse, source: WatchHistoryItem["source"]): WatchHistoryItem {
  return {
    id: item.id,
    slug: item.movieId,
    name: item.movieTitle,
    thumb_url: item.moviePoster || "",
    origin_name: item.movieTitle,
    episode_current: "",
    year: 0,
    quality: "",
    currentEpSlug: "",
    currentEpName: "",
    currentTime: item.progress,
    duration: item.duration,
    watchedAt: new Date(item.watchedAt).getTime(),
    source,
  };
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      watchHistory: [],
      searchHistory: [],
      isSyncing: false,
      lastSyncedAt: null,

      addWatchHistory: async (item) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        const newItem: WatchHistoryItem = {
          ...item,
          id: `local-${Date.now()}`,
          currentTime: 0,
          watchedAt: Date.now(),
        };

        set((state) => {
          const filtered = state.watchHistory.filter((h) => h.slug !== item.slug);
          return { watchHistory: [newItem, ...filtered].slice(0, 50) };
        });

        // Sync to database if logged in
        if (isAuthenticated) {
          try {
            await watchHistoryApi.createWatchHistory(toDbFormat(newItem));
          } catch (error) {
            console.error("Failed to sync watch history to database:", error);
          }
        }
      },

      updateWatchProgress: async (slug, currentTime, duration) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        const now = Date.now();

        set((state) => ({
          watchHistory: state.watchHistory.map((h) =>
            h.slug === slug
              ? { ...h, currentTime, duration, watchedAt: now }
              : h,
          ),
        }));

        // Sync to database if logged in
        if (isAuthenticated) {
          try {
            const completed = duration > 0 && currentTime >= duration * 0.9;
            await watchHistoryApi.updateWatchHistory(slug, {
              progress: currentTime,
              duration,
              completed,
            });
          } catch (error) {
            console.error("Failed to update watch progress in database:", error);
          }
        }
      },

      removeWatchHistory: async (slug) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        set((state) => ({
          watchHistory: state.watchHistory.filter((h) => h.slug !== slug),
        }));

        // Remove from database if logged in
        if (isAuthenticated) {
          try {
            await watchHistoryApi.deleteWatchHistory(slug);
          } catch (error) {
            console.error("Failed to remove watch history from database:", error);
          }
        }
      },

      clearWatchHistory: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        set({ watchHistory: [] });

        // Clear from database if logged in
        if (isAuthenticated) {
          try {
            await watchHistoryApi.deleteAllWatchHistory();
          } catch (error) {
            console.error("Failed to clear watch history from database:", error);
          }
        }
      },

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

      // Sync from database - load user data from server
      syncFromDatabase: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        set({ isSyncing: true });
        try {
          const response = await watchHistoryApi.getWatchHistory(1, 50);
          const dbItems = response.data.map((item) =>
            fromDbFormat(item, "ophim")
          );

          set({
            watchHistory: dbItems,
            lastSyncedAt: Date.now(),
            isSyncing: false,
          });
        } catch (error) {
          console.error("Failed to sync watch history from database:", error);
          set({ isSyncing: false });
        }
      },

      // Sync to database - upload local data to server
      syncToDatabase: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        const { watchHistory } = get();
        set({ isSyncing: true });

        try {
          for (const item of watchHistory) {
            await watchHistoryApi.createWatchHistory(toDbFormat(item));
          }
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error("Failed to sync watch history to database:", error);
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "pinuss-flix-history",
    },
  ),
);
