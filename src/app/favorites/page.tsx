"use client";

import { Heart, Play } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MovieImage from "@/components/features/Movies/MovieImage";
import Empty from "@/components/Common/Empty";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/lib/api/favorites/favoriteQueries";
import { FavoriteSource } from "@/lib/api/favorites/favoriteInterface";
import { formatTimeAgo } from "@/services/dateService";
import { toast } from "sonner";
import { useRemoveFavorite } from "@/lib/api/favorites/favoriteQueries";

export default function FavoritesPage() {
  const { data, isLoading } = useFavorites();
  const removeMutation = useRemoveFavorite();

  const favorites = data?.data ?? [];

  const handleRemove = async (movieId: string, source?: string) => {
    try {
      await removeMutation.mutateAsync({
        movieId,
        source: source as FavoriteSource | undefined,
      });
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
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

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <LoginBenefitsCard
          storageKey="favorites-empty-benefits"
          variant="inline"
          className="mb-6"
        />
        <Empty
          icon={Heart}
          title="Chưa có phim yêu thích"
          description="Nhấn vào biểu tượng trái tim trên phim để thêm vào danh sách yêu thích"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.pagination?.total || 0} phim
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
        <AnimatePresence>
          {favorites.map((favorite) => (
            <FavoriteCard
              key={`${favorite.movieId}-${favorite.source}`}
              favorite={favorite}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface FavoriteCardProps {
  favorite: {
    _id: string;
    movieId: string;
    movieSlug: string;
    movieTitle: string;
    moviePoster: string;
    movieYear?: number;
    movieType?: "single" | "series";
    source: FavoriteSource;
    createdAt: string;
  };
  onRemove: (movieId: string, source?: string) => void;
}

function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      <Link
        href={`/phim/${favorite.movieSlug}?source=${favorite.source}`}
        className="block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <MovieImage
            movie={{
              slug: favorite.movieSlug,
              name: favorite.movieTitle,
              poster_url: favorite.moviePoster,
              thumb_url: favorite.moviePoster,
            }}
            source={favorite.source === "phimapi" ? "phimapi" : "ophim"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Remove button */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(favorite.movieId, favorite.source);
            }}
            size="icon"
            variant="outline"
            className="absolute top-1.5 right-1.5 z-20 size-8 bg-red-500/90 hover:bg-red-600 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="w-3 h-3 fill-current" />
          </Button>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Type badge */}
          {favorite.movieType && (
            <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
              {favorite.movieType === "series" ? "Phim bộ" : "Phim lẻ"}
            </span>
          )}

          {/* Source badge */}
          <span className="absolute bottom-2 right-2 bg-background/60 backdrop-blur-sm text-foreground text-[9px] font-medium px-1.5 py-0.5 rounded">
            {favorite.source}
          </span>
        </div>

        <div className="mt-2 text-[12px] md:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {favorite.movieTitle}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {favorite.movieYear && (
            <span className="text-[10px] md:text-xs text-muted-foreground">
              {favorite.movieYear}
            </span>
          )}
          <span className="text-[10px] md:text-xs text-muted-foreground">
            · {formatTimeAgo(new Date(favorite.createdAt).getTime())}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
