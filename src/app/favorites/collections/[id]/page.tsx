"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Play, Trash2, Plus, Film, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MovieImage from "@/components/features/Movies/MovieImage";
import Empty from "@/components/Common/Empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCollection,
  useRemoveMovieFromCollection,
  useRemovedMovies,
  useRestoreMovie,
} from "@/lib/api/collections/collectionQueries";
import { toast } from "sonner";
import { formatTimeAgo } from "@/services/dateService";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showRemoved, setShowRemoved] = useState(false);

  const { data, isLoading, isError } = useCollection(id);
  const { data: removedData } = useRemovedMovies(id);
  const removeMovieMutation = useRemoveMovieFromCollection();
  const restoreMovieMutation = useRestoreMovie();

  if (isLoading) {
    return <CollectionDetailSkeleton />;
  }

  if (isError || !data?.data) {
    notFound();
  }

  const collection = data.data;
  const items = collection.items ?? [];
  const removedItems = removedData?.data ?? [];

  const handleRemoveMovie = async (movieId: string, source?: string) => {
    try {
      await removeMovieMutation.mutateAsync({
        collectionId: id,
        movieId,
        source,
      });
      toast.success("Đã xóa phim khỏi bộ sưu tập");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleRestoreMovie = async (movieId: string, source?: string) => {
    try {
      await restoreMovieMutation.mutateAsync({
        collectionId: id,
        movieId,
        source,
      });
      toast.success("Đã khôi phục phim vào bộ sưu tập");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="pb-8">
      {/* Back button */}
      {/* Collection header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-muted-foreground text-sm mb-3">
                {collection.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{collection.itemCount} phim</span>
              <span>·</span>
              <span>
                Tạo {formatTimeAgo(new Date(collection.createdAt).getTime())}
              </span>
              {collection.isPublic && (
                <>
                  <span>·</span>
                  <span className="text-primary">Công khai</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies grid */}
      {items.length === 0 && !showRemoved ? (
        <Empty
          icon={Film}
          title="Bộ sưu tập trống"
          description="Thêm phim vào bộ sưu tập này từ trang chi tiết phim"
          action={{
            label: "Khám phá phim",
            onClick: () => router.push("/"),
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Active movies */}
          {items.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Danh sách phim ({items.length})
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <CollectionMovieCard
                      key={`${item.movieId}-${item.source}`}
                      item={item}
                      onRemove={handleRemoveMovie}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Removed movies section */}
          {removedItems.length > 0 && (
            <div>
              <button
                onClick={() => setShowRemoved(!showRemoved)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đã xóa ({removedItems.length})</span>
                <span className="text-xs">
                  {showRemoved ? "(Ẩn)" : "(Hiện)"}
                </span>
              </button>

              {showRemoved && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-muted-foreground">
                    Các phim đã xóa có thể được khôi phục
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                    <AnimatePresence>
                      {removedItems.map((item) => (
                        <RemovedMovieCard
                          key={`${item.movieId}-${item.source}`}
                          item={item}
                          onRestore={handleRestoreMovie}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CollectionMovieCardProps {
  item: {
    _id: string;
    movieId: string;
    movieSlug: string;
    movieTitle: string;
    moviePoster: string;
    movieYear?: number;
    movieType?: "single" | "series";
    source: string;
    addedAt: string;
  };
  onRemove: (movieId: string, source?: string) => void;
}

function CollectionMovieCard({ item, onRemove }: CollectionMovieCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      <Link
        href={`/phim/${item.movieSlug}?source=${item.source}`}
        className="block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <MovieImage
            movie={{
              slug: item.movieSlug,
              name: item.movieTitle,
              poster_url: item.moviePoster,
              thumb_url: item.moviePoster,
            }}
            source={item.source === "phimapi" ? "phimapi" : "ophim"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Remove button */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.movieId, item.source);
            }}
            size="icon"
            variant="outline"
            className="absolute top-1.5 right-1.5 z-20 size-8 bg-destructive/90 hover:bg-destructive flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </Button>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Type badge */}
          {item.movieType && (
            <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
              {item.movieType === "series" ? "Phim bộ" : "Phim lẻ"}
            </span>
          )}
        </div>

        <div className="mt-2 text-[12px] md:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.movieTitle}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {item.movieYear && (
            <span className="text-[10px] md:text-xs text-muted-foreground">
              {item.movieYear}
            </span>
          )}
          <span className="text-[10px] md:text-xs text-muted-foreground">
            · Thêm {formatTimeAgo(new Date(item.addedAt).getTime())}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

interface RemovedMovieCardProps {
  item: {
    _id: string;
    movieId: string;
    movieSlug: string;
    movieTitle: string;
    moviePoster: string;
    movieYear?: number;
    movieType?: "single" | "series";
    source: string;
    addedAt: string;
    deletedAt?: string;
  };
  onRestore: (movieId: string, source?: string) => void;
}

function RemovedMovieCard({ item, onRestore }: RemovedMovieCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.6, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group opacity-60 hover:opacity-80 transition-opacity"
    >
      <div className="block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)] grayscale">
          <MovieImage
            movie={{
              slug: item.movieSlug,
              name: item.movieTitle,
              poster_url: item.moviePoster,
              thumb_url: item.moviePoster,
            }}
            source={item.source === "phimapi" ? "phimapi" : "ophim"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Restore button */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRestore(item.movieId, item.source);
            }}
            size="icon"
            variant="outline"
            className="absolute top-1.5 right-1.5 z-20 size-8 bg-green-500/90 hover:bg-green-600 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>

          {/* Removed badge */}
          <span className="absolute top-2 left-2 bg-muted/90 backdrop-blur-sm text-muted-foreground text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
            <Trash2 className="w-2.5 h-2.5" />
            Đã xóa
          </span>
        </div>

        <div className="mt-2 text-[12px] md:text-sm font-medium text-muted-foreground line-clamp-2 leading-snug">
          {item.movieTitle}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {item.movieYear && (
            <span className="text-[10px] md:text-xs text-muted-foreground">
              {item.movieYear}
            </span>
          )}
          {item.deletedAt && (
            <span className="text-[10px] md:text-xs text-destructive">
              · Xóa {formatTimeAgo(new Date(item.deletedAt).getTime())}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CollectionDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <Skeleton className="h-10 w-24 mb-6" />
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
