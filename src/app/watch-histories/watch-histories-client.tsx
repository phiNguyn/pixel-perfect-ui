"use client";

import { useHistoryStore, WatchHistoryItem } from "@/stores/useHistoryStore";
import {
  X,
  Play,
  Clock,
  History,
  Trash2,
  Film,
  SearchX,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import MovieImage from "@/components/features/Movies/MovieImage";
import { normalizeEpisode } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Empty from "@/components/Common/Empty";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";
import { formatTimeAgo } from "@/services/dateService";
import {
  StatsLineChart,
  StatsBarChart,
} from "@/components/features/Charts/StatsCharts";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ViewMode = "grid" | "list";

// Chart data generation helpers
function generateWatchTrendData(history: WatchHistoryItem[]) {
  if (history.length === 0) return [];

  // Group by day for last 14 days
  const days: Record<string, number> = {};
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Initialize last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now - i * dayMs);
    const key = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    days[key] = 0;
  }

  // Count movies watched per day
  history.forEach((item) => {
    const date = new Date(item.watchedAt);
    const key = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    if (key in days) {
      days[key]++;
    }
  });

  return Object.entries(days).map(([name, value]) => ({ name, value }));
}

function generateCategoryData(history: WatchHistoryItem[]) {
  if (history.length === 0) return [];

  // Since we don't have category info, we'll use quality as a proxy
  const qualities: Record<string, number> = {};

  history.forEach((item) => {
    const quality = item.quality || "Khác";
    qualities[quality] = (qualities[quality] || 0) + 1;
  });

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  return Object.entries(qualities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
}

// Chart Summary Component
function WatchHistoryCharts({ history }: { history: WatchHistoryItem[] }) {
  const trendData = useMemo(() => generateWatchTrendData(history), [history]);
  const categoryData = useMemo(() => generateCategoryData(history), [history]);

  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Watch Trend Line Chart */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">
            Xu hướng xem (14 ngày gần nhất)
          </h3>
        </div>
        <div className="h-40">
          {trendData.length > 0 ? (
            <StatsLineChart
              data={trendData}
              color="primary"
              valueFormatter={(v) => `${v} phim`}
              showDots={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Chưa có đủ dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Quality Distribution Bar Chart */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Phân bố theo chất lượng</h3>
        </div>
        <div className="h-40">
          {categoryData.length > 0 ? (
            <StatsBarChart
              data={categoryData}
              color="violet"
              valueFormatter={(v) => `${v} phim`}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WatchHistoriesClient() {
  const { watchHistory, removeWatchHistory, clearWatchHistory } =
    useHistoryStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const sortedHistory = [...watchHistory].sort(
    (a, b) => b.watchedAt - a.watchedAt,
  );

  const handleClearAll = () => {
    clearWatchHistory();
    setShowClearDialog(false);
  };

  if (watchHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Lịch sử xem
          </h1>
          <p className="text-muted-foreground text-sm">
            Theo dõi và xem lại các phim bạn đã xem
          </p>
        </div>

        <LoginBenefitsCard
          storageKey="watch-histories-empty-benefits"
          className="mb-6"
          variant="inline"
        />

        <Empty
          icon={History}
          title="Chưa có lịch sử xem"
          description="Bắt đầu xem phim để lịch sử xem được ghi lại tại đây"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <LoginBenefitsCard
        storageKey="watch-histories-benefits"
        className="mb-6"
        variant="inline"
      />

      {/* Watch History Charts */}
      <WatchHistoryCharts history={watchHistory} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Lịch sử xem
          </h1>
          <p className="text-muted-foreground text-sm">
            {watchHistory.length} phim đã xem
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List
            </button>
          </div>

          {/* Clear all button */}
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tất cả
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa lịch sử xem?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa tất cả {watchHistory.length} phim khỏi
                  lịch sử xem của bạn. Bạn không thể hoàn tác hành động này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa tất cả
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
          <AnimatePresence>
            {sortedHistory.map((item) => (
              <WatchHistoryGridCard
                key={item.slug}
                item={item}
                onRemove={removeWatchHistory}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5 md:col-span-4">Phim</div>
              <div className="col-span-2 hidden md:block">Tập</div>
              <div className="col-span-2">Tiến độ</div>
              <div className="col-span-3 md:col-span-2">Xem lúc</div>
              <div className="col-span-2 md:col-span-2">Hành động</div>
            </div>
          </div>
          <ScrollArea>
            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {sortedHistory.map((item) => (
                  <WatchHistoryListRow
                    key={item.slug}
                    item={item}
                    onRemove={removeWatchHistory}
                  />
                ))}
              </AnimatePresence>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export function WatchHistoryGridCard({
  item,
  onRemove,
}: {
  item: WatchHistoryItem;
  onRemove?: (slug: string) => void;
}) {
  const progress =
    item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      <Link
        href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}
        className="block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <MovieImage movie={item} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Remove button */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.slug);
            }}
            size="icon"
            variant="outline"
            className="absolute top-1.5 right-1.5 z-20 size-8 bg-gray-500/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Episode badge */}
          {item.currentEpName && (
            <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
              Tập {normalizeEpisode(item.currentEpName)}
            </span>
          )}

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
          {item.currentTime > 0 && item.duration > 0 && (
            <div className="absolute bottom-1.5 left-2 right-2">
              <span className="text-[9px] text-foreground/80 bg-background/40 backdrop-blur-sm px-1 rounded">
                {formatDuration(item.currentTime)} /{" "}
                {formatDuration(item.duration)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 text-[12px] md:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.name}
        </div>
        {item.origin_name && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {item.origin_name}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {formatTimeAgo(item.watchedAt)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function WatchHistoryListRow({
  item,
  onRemove,
}: {
  item: WatchHistoryItem;
  onRemove?: (slug: string) => void;
}) {
  const progress =
    item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 hover:bg-muted/30 transition-colors group"
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Movie info */}
        <div className="col-span-5 md:col-span-4 flex items-center gap-3">
          <Link
            href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}
            className="relative flex-shrink-0"
          >
            <div className="relative w-14 h-20 rounded-md overflow-hidden">
              <MovieImage movie={item} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </Link>
          <div className="min-w-0">
            <Link
              href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}
            >
              <h3 className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                {item.name}
              </h3>
            </Link>
            {item.origin_name && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.origin_name}
              </p>
            )}
            {item.year && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.year}
              </p>
            )}
          </div>
        </div>

        {/* Episode */}
        <div className="col-span-2 hidden md:block">
          {item.currentEpName ? (
            <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
              Tập {normalizeEpisode(item.currentEpName)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>

        {/* Progress */}
        <div className="col-span-2">
          {item.duration > 0 ? (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {Math.round(progress)}%
              </p>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>

        {/* Watched time */}
        <div className="col-span-3 md:col-span-2">
          <p
            className="text-xs text-muted-foreground"
            title={formatDate(item.watchedAt)}
          >
            {formatTimeAgo(item.watchedAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="col-span-2 md:col-span-2 flex items-center justify-start gap-1">
          <Button asChild size="sm" variant="ghost">
            <Link
              href={`/phim/${item.slug}?ep=${item.currentEpSlug}&source=${item.source}`}
            >
              <Play className="w-4 h-4 mr-1" />
              Xem lại
            </Link>
          </Button>
          <Button
            onClick={() => onRemove(item.slug)}
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
