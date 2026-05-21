"use client";

import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryTrendingMovies } from "@/lib/api/trending/trendingQuery";
import { TrendingMovie } from "@/lib/api/viewLog/viewLogInterface";

interface TrendingMoviesProps {
  excludeSlug?: string;
  title?: string;
  limit?: number;
}

function TrendingMovieSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="w-12 h-16 rounded object-cover flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingItem({
  movie,
  rank,
}: {
  movie: TrendingMovie;
  rank: number;
}) {
  const isTop3 = rank <= 3;

  const slug = movie.movieTitle
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Image URL - có thể là full URL hoặc path tương đối
  const getImageUrl = () => {
    if (!movie.moviePoster) return null;
    if (movie.moviePoster.startsWith("http")) {
      return movie.moviePoster;
    }
    return `https://img.ophim.live/uploads/movies/${movie.moviePoster}`;
  };

  const imageUrl = getImageUrl();

  return (
    <Link
      href={`/phim/${movie.movieId}?source=${movie.source || "ophim"}`}
      className="flex items-center gap-3 group cursor-pointer"
    >
      <span
        className={`text-lg font-black w-6 text-center flex-shrink-0 ${
          isTop3 ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {rank}
      </span>

      {imageUrl ? (
        <img
          loading="lazy"
          width={48}
          height={64}
          src={imageUrl}
          alt={movie.movieTitle || "Movie"}
          className="w-12 h-16 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-16 rounded bg-muted flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.movieTitle || movie.movieId}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {movie.year && `${movie.year}`}
          {movie.year && movie.quality && " · "}
          {movie.quality}
        </p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="text-primary font-medium">{movie.viewCount}</span> lượt xem
        </p>
      </div>
    </Link>
  );
}

export default function TrendingMovies({
  title = "🔥 Top phim được xem nhiều nhất",
  limit = 10,
  excludeSlug,
}: TrendingMoviesProps) {
  const {
    data: trendingMovies,
    isLoading,
    isError,
  } = useQueryTrendingMovies(excludeSlug, limit);

  if (isLoading) {
    return (
      <aside className="lg:w-[300px] flex-shrink-0 hidden md:block">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          {title}
        </h3>
        <TrendingMovieSkeleton />
      </aside>
    );
  }

  if (isError || !trendingMovies || trendingMovies.length === 0) {
    return null;
  }



  return (
    <aside className="lg:w-[300px] flex-shrink-0 hidden md:block">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-3">
        {trendingMovies.map((movie, index) => (
          <TrendingItem key={movie.movieId} movie={movie} rank={index + 1} />
        ))}
      </div>
    </aside>
  );
}
