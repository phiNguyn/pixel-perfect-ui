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
  localHistoryBeforeSync: WatchHistoryItem[];
  localHistorySyncStartedAt: number | null;
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
  syncLocalToDatabase: () => Promise<number>;
  mergeWatchHistory: () => Promise<{ merged: number; localOnly: number }>;
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
      localHistoryBeforeSync: [],
      localHistorySyncStartedAt: null,

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

      // Sync local history to database (for un-authenticated users who just logged in)
      syncLocalToDatabase: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return 0;

        const { localHistoryBeforeSync, watchHistory } = get();
        const itemsToSync = localHistoryBeforeSync.length > 0
          ? localHistoryBeforeSync
          : watchHistory.filter(item => !item.id.startsWith("local-") === false);

        if (itemsToSync.length === 0) return 0;

        set({ isSyncing: true });

        try {
          const itemsToUpload = itemsToSync.map(item => ({
            ...toDbFormat(item),
            movieId: item.slug,
          }));
          const result = await watchHistoryApi.bulkCreateWatchHistory(itemsToUpload);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
          return result.upsertedCount;
        } catch (error) {
          console.error("Failed to sync local history to database:", error);
          set({ isSyncing: false });
          return 0;
        }
      },

      // Merge local history with database history on login
      // Strategy: Keep the most recent/watched version of each movie
      mergeWatchHistory: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return { merged: 0, localOnly: 0 };

        const { localHistoryBeforeSync } = get();
        if (localHistoryBeforeSync.length === 0) return { merged: 0, localOnly: 0 };

        set({ isSyncing: true });

        try {
          // Fetch database history
          const response = await watchHistoryApi.getWatchHistory(1, 50);
          const dbItems = response.data.map((item) =>
            fromDbFormat(item, "ophim")
          );
          const dbHistoryMap = new Map(dbItems.map(item => [item.slug, item]));

          // Separate local items into categories
          const localOnly: WatchHistoryItem[] = []; // Only in local
          const needUpdate: WatchHistoryItem[] = []; // In both, local is newer
          const keepDb: string[] = []; // In both, DB is newer (keep DB)

          for (const localItem of localHistoryBeforeSync) {
            const dbItem = dbHistoryMap.get(localItem.slug);

            if (dbItem) {
              if (localItem.watchedAt > dbItem.watchedAt) {
                needUpdate.push(localItem);
              } else {
                keepDb.push(localItem.slug);
              }
            } else {
              localOnly.push(localItem);
            }
          }

          // Bulk upload localOnly items
          if (localOnly.length > 0) {
            const localOnlyToUpload = localOnly.map(toDbFormat);
            await watchHistoryApi.bulkCreateWatchHistory(localOnlyToUpload);
          }

          // Bulk update needUpdate items
          if (needUpdate.length > 0) {
            const needUpdateToUpload = needUpdate.map(item => ({
              ...toDbFormat(item),
              movieId: item.slug,
            }));
            await watchHistoryApi.bulkCreateWatchHistory(needUpdateToUpload);
          }

          // Build final merged list
          const merged: WatchHistoryItem[] = [];

          // Add localOnly items (now in DB)
          for (const item of localOnly) {
            merged.push({ ...item });
          }

          // Add needUpdate items (updated in DB)
          for (const item of needUpdate) {
            const dbItem = dbHistoryMap.get(item.slug);
            if (dbItem) {
              merged.push({ ...item, id: dbItem.id });
            }
          }

          // Add keepDb items from DB
          for (const dbItem of dbItems) {
            if (keepDb.includes(dbItem.slug)) {
              merged.push(dbItem);
            }
          }

          // Add DB-only items (not in local)
          for (const dbItem of dbItems) {
            if (!localHistoryBeforeSync.find(l => l.slug === dbItem.slug)) {
              merged.push(dbItem);
            }
          }

          // Sort by watchedAt descending
          merged.sort((a, b) => b.watchedAt - a.watchedAt);

          set({
            watchHistory: merged.slice(0, 50),
            lastSyncedAt: Date.now(),
            localHistoryBeforeSync: [],
            isSyncing: false,
          });

          return { merged: needUpdate.length, localOnly: localOnly.length };
        } catch (error) {
          console.error("Failed to merge watch history:", error);
          set({ isSyncing: false });
          return { merged: 0, localOnly: localHistoryBeforeSync.length };
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
        localHistoryBeforeSync: state.localHistoryBeforeSync,
        localHistorySyncStartedAt: state.localHistorySyncStartedAt,
      }),
    },
  ),
);
