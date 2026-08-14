"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCheckFavorite,
  useAddFavorite,
  useRemoveFavorite,
} from "@/lib/api/favorites/favoriteQueries";
import { FavoriteSource } from "@/lib/api/favorites/favoriteInterface";
import { toast } from "sonner";

interface FavoriteButtonProps {
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster?: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source?: FavoriteSource;
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function FavoriteButton({
  movieId,
  movieSlug,
  movieTitle,
  moviePoster,
  movieYear,
  movieType,
  source = "ophim",
  size = "default",
  className,
}: FavoriteButtonProps) {
  const { isAuthenticated, openLoginModal } = useAuth();

  const { data: checkData, isLoading: isChecking } = useCheckFavorite(
    movieId,
    source,
  );
  const isFavorited = checkData?.isFavorited ?? false;

  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleToggle = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      if (isFavorited) {
        await removeMutation.mutateAsync({ movieId, source });
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addMutation.mutateAsync({
          movieId,
          movieSlug,
          movieTitle,
          moviePoster,
          movieYear,
          movieType,
          source,
        });
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };
  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={cn(
        "transition-all duration-200",
        isFavorited && [
          "bg-primary hover:bg-primary/90",
          "border-primary hover:border-primary/90",
          "text-primary-foreground",
        ],
        className,
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-200",
          isFavorited && "fill-current scale-110",
        )}
      />
      {size !== "icon" && <span>Yêu thích</span>}
    </Button>
  );
}

export default FavoriteButton;
