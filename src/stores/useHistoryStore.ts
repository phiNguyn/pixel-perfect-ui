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
  removedHistory: WatchHistoryItem[];
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
  restoreWatchHistory: (slug: string) => Promise<void>;
  clearWatchHistory: () => Promise<void>;
  addSearchHistory: (item: SearchHistoryItem) => void;
  removeSearchHistory: (slug: string) => void;
  clearSearchHistory: () => void;
  syncFromDatabase: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
  flushPendingUpdates: () => Promise<void>;
}

// Debounce map to prevent excessive API calls
const pendingUpdates = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_MS = 5000; // Only sync to server every 5 seconds

// Flush all pending updates immediately (used when user changes episode or leaves page)
async function flushPendingUpdates() {
  const { watchHistory } = useHistoryStore.getState();
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  // Clear all pending timeouts and sync immediately
  const slugs = Array.from(pendingUpdates.keys());
  pendingUpdates.forEach((timeout) => clearTimeout(timeout));
  pendingUpdates.clear();

  if (!isAuthenticated) return;

  // Sync all current watch history to server
  for (const slug of slugs) {
    const item = watchHistory.find((h) => h.slug === slug);
    if (item) {
      try {
        const completed = item.duration > 0 && item.currentTime >= item.duration * 0.9;
        await watchHistoryApi.updateWatchHistory(slug, {
          movieTitle: item.name,
          moviePoster: item.thumb_url,
          originName: item.origin_name,
          episodeCurrent: item.episode_current,
          year: item.year,
          quality: item.quality,
          progress: item.currentTime,
          duration: item.duration,
          completed,
          currentEpSlug: item.currentEpSlug,
          currentEpName: item.currentEpName,
          source: item.source,
        });
      } catch (error) {
        console.error("Failed to flush watch progress:", error);
      }
    }
  }
}

// Convert local format to database format
function toDbFormat(item: WatchHistoryItem) {
  return {
    movieId: item.slug,
    movieTitle: item.name,
    moviePoster: item.thumb_url,
    originName: item.origin_name,
    episodeCurrent: item.episode_current,
    year: item.year,
    quality: item.quality,
    progress: item.currentTime,
    duration: item.duration,
    completed: item.duration > 0 && item.currentTime >= item.duration * 0.9,
    currentEpSlug: item.currentEpSlug,
    currentEpName: item.currentEpName,
    source: item.source,
  };
}

// Convert database format to local format
function fromDbFormat(
  item: WatchHistoryResponse,
  defaultSource: WatchHistoryItem["source"]
): WatchHistoryItem {
  return {
    id: item.id,
    slug: item.movieId,
    name: item.movieTitle,
    thumb_url: item.moviePoster || "",
    origin_name: item.originName || item.movieTitle,
    episode_current: item.episodeCurrent || "",
    year: item.year || 0,
    quality: item.quality || "",
    currentEpSlug: item.currentEpSlug || "",
    currentEpName: item.currentEpName || "",
    currentTime: item.progress,
    duration: item.duration,
    watchedAt: new Date(item.watchedAt).getTime(),
    source: item.source || defaultSource,
  };
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      watchHistory: [],
      removedHistory: [],
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
        const now = Date.now();

        // Always update local state immediately for responsive UI
        set((state) => ({
          watchHistory: state.watchHistory.map((h) =>
            h.slug === slug
              ? { ...h, currentTime, duration, watchedAt: now }
              : h,
          ),
        }));

        // Cancel any pending update for this slug
        const existingTimeout = pendingUpdates.get(slug);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Debounce API call - only sync to server after 5 seconds of inactivity
        const timeout = setTimeout(async () => {
          pendingUpdates.delete(slug);

          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!isAuthenticated) return;

          // Get current item data for episode and source info
          const item = useHistoryStore.getState().watchHistory.find((h) => h.slug === slug);
          if (!item) return;

          try {
            const completed = duration > 0 && currentTime >= duration * 0.9;
            await watchHistoryApi.updateWatchHistory(slug, {
              movieTitle: item.name,
              moviePoster: item.thumb_url,
              originName: item.origin_name,
              episodeCurrent: item.episode_current,
              year: item.year,
              quality: item.quality,
              progress: currentTime,
              duration,
              completed,
              currentEpSlug: item.currentEpSlug,
              currentEpName: item.currentEpName,
              source: item.source,
            });
          } catch (error) {
            console.error("Failed to update watch progress in database:", error);
          }
        }, DEBOUNCE_MS);

        pendingUpdates.set(slug, timeout);
      },

      removeWatchHistory: async (slug) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        // Get item before removing
        const { watchHistory } = get();
        const itemToRemove = watchHistory.find((h) => h.slug === slug);

        set((state) => ({
          watchHistory: state.watchHistory.filter((h) => h.slug !== slug),
          // Keep in removedHistory for potential restore
          removedHistory: itemToRemove
            ? [...state.removedHistory.filter((h) => h.slug !== slug), { ...itemToRemove, watchedAt: Date.now() }]
            : state.removedHistory,
        }));

        // Soft delete in database if logged in
        if (isAuthenticated) {
          try {
            await watchHistoryApi.deleteWatchHistory(slug);
          } catch (error) {
            console.error("Failed to remove watch history from database:", error);
          }
        }
      },

      restoreWatchHistory: async (slug) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        // Get item from removedHistory
        const { removedHistory } = get();
        const itemToRestore = removedHistory.find((h) => h.slug === slug);

        if (!itemToRestore) return;

        set((state) => ({
          watchHistory: [
            { ...itemToRestore, watchedAt: Date.now() },
            ...state.watchHistory,
          ],
          removedHistory: state.removedHistory.filter((h) => h.slug !== slug),
        }));

        // Restore in database if logged in
        if (isAuthenticated) {
          try {
            const restored = await watchHistoryApi.restoreWatchHistory(slug);
            // Update with latest data from server
            const restoredItem = fromDbFormat(restored, itemToRestore.source);
            set((state) => ({
              watchHistory: state.watchHistory.map((h) =>
                h.slug === slug ? { ...restoredItem, watchedAt: Date.now() } : h
              ),
            }));
          } catch (error) {
            console.error("Failed to restore watch history from database:", error);
          }
        }
      },

      clearWatchHistory: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        // Cancel all pending updates
        pendingUpdates.forEach((timeout) => clearTimeout(timeout));
        pendingUpdates.clear();

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

      flushPendingUpdates,
    }),
    {
      name: "pinuss-flix-history",
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        removedHistory: state.removedHistory,
        searchHistory: state.searchHistory,
      }),
    },
  ),
);
