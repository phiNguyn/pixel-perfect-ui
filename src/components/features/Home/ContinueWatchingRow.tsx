"use client";

import { useHistoryStore, WatchHistoryItem } from "@/stores/useHistoryStore";
import { X, Play } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MovieImage from "../Movies/MovieImage";
import { normalizeEpisode } from "@/lib/utils";
import { SectionHeader, CARD_WIDTH_CLASS } from "../Movies/MovieRow";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ContinueWatchingRow() {
  const { watchHistory, removeWatchHistory } = useHistoryStore();

  if (watchHistory.length === 0) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeader
          title="▶ Tiếp tục xem"
          subtitle="Bạn đang xem dở những phim này"
          href="/watch-histories"
        />

        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth">
          <AnimatePresence initial={false}>
            {watchHistory
              .slice()
              .sort((a, b) => b.watchedAt - a.watchedAt)
              .slice(0, 12)
              .map((item) => (
                <ContinueWatchingCard
                  key={item.slug}
                  item={item}
                  onRemove={removeWatchHistory}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ContinueWatchingCard({
  item,
  onRemove,
}: {
  item: WatchHistoryItem;
  onRemove: (slug: string) => void;
}) {
  const progress =
    item.duration > 0
      ? Math.min((item.currentTime / item.duration) * 100, 100)
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={cn("relative flex-shrink-0 group snap-start", CARD_WIDTH_CLASS)}
    >
      <button
        type="button"
        aria-label={`Xoá ${item.name} khỏi danh sách tiếp tục xem`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.slug);
        }}
        className="absolute top-1.5 right-1.5 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm ring-1 ring-border/50 flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <Link
        href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/40 ring-1 ring-border/40 transition-transform duration-300 group-hover:scale-[1.03]">
          <MovieImage movie={item} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </span>
          </div>

          <span className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-md ring-1 ring-border/40">
            Tập {normalizeEpisode(item.currentEpName)}
          </span>

          {item.currentTime > 0 && (
            <span className="absolute bottom-3 left-2 text-[10px] text-foreground/85">
              {formatDuration(item.currentTime)} /{" "}
              {formatDuration(item.duration)}
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h3 className="mt-2 text-[13px] md:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          Tập {normalizeEpisode(item.currentEpName)} · {Math.round(progress)}%
        </p>
      </Link>
    </motion.div>
  );
}
