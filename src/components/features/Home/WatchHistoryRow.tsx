"use client";

import { useHistoryStore, WatchHistoryItem } from '@/stores/useHistoryStore';
import { X, Play, Clock, History } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import MovieImage from '../Movies/MovieImage';

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WatchHistoryRow() {
  const { watchHistory, removeWatchHistory, clearWatchHistory } = useHistoryStore();

  if (watchHistory.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h2 className="text-base md:text-lg font-semibold text-foreground">Xem gần đây</h2>
          <span className="text-xs text-muted-foreground">({watchHistory.length})</span>
        </div>
        {watchHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={clearWatchHistory}
          >
            Xoá tất cả
          </Button>
        )}
      </div>

      <ScrollArea className="w-full px-4 max-w-[1400px] mx-auto">
        <div className="flex gap-3 pb-4">
          <AnimatePresence>
            {watchHistory.sort((a, b) => b.watchedAt - a.watchedAt).map((item) => (
              <WatchHistoryCard key={item.slug} item={item} onRemove={removeWatchHistory} />
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

function WatchHistoryCard({ item, onRemove }: { item: WatchHistoryItem; onRemove: (slug: string) => void }) {
  const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex-shrink-0 w-[140px] md:w-[170px] group"
    >
      {/* Remove button */}
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.slug);
        }}
        size='icon'
        variant='outline'
        className="absolute top-1.5 size-10 right-1.5 z-20 bg-gray-500/90   flex items-center justify-center shadow-md "

      >
        <X className="w-3 h-3" />
      </Button>

      <Link href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <MovieImage
            movie={item}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Episode badge */}
          <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
            {item.source === "phimapi" ? item.currentEpName : `Tập ${item.currentEpName}`}
          </span>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
              <div
                className="h-full bg-primary rounded-r-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Time info */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
            {item.currentTime > 0 && (
              <span className="text-[9px] text-foreground/80 bg-background/40 backdrop-blur-sm px-1 rounded">
                {formatDuration(item.currentTime)} / {formatDuration(item.duration)}
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-2 text-xs font-medium text-foreground line-clamp-1 leading-snug">{item.name}</h3>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock className="w-2.5 h-2.5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">{formatTimeAgo(item.watchedAt)}</p>
        </div>
      </Link>
    </motion.div>
  );
}