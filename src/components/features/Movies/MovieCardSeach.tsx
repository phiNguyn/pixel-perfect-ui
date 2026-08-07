"use client";

import { Movie } from "@/lib/api/movies/movieInterface";
import { FC } from "react";
import Link from "next/link";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { getImageSrc } from "@/services/uploadFile";

interface MovieCardSeachProps {
  movie: Movie;
  onSelect?: () => void;
  source: "ophim" | "phimapi" | "nguonc";
}
const MovieCardSeach: FC<MovieCardSeachProps> = ({
  movie,
  onSelect,
  source,
}) => {
  const { addSearchHistory } = useHistoryStore();

  const handleClick = () => {
    addSearchHistory({
      slug: movie.slug,
      name: movie.name,
      thumb_url: source === "phimapi" ? movie.poster_url : movie.thumb_url,
      year: movie.year,
      episode_current: movie.episode_current,
      searchedAt: Date.now(),
      source: source,
    });
    onSelect?.();
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ophim":
        return "OP";
      case "phimapi":
        return "PA";
      case "nguonc":
        return "NC";
      default:
        return source.toUpperCase().slice(0, 2);
    }
  };

  return (
    <Link
      href={`/phim/${movie.slug}?source=${source}`}
      onClick={handleClick}
      className="flex items-center gap-3 group cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        <img
          loading="lazy"
          width={48}
          height={64}
          src={getImageSrc(
            source === "phimapi" ? movie.poster_url : movie.thumb_url,
            source || "ophim",
          )}
          alt={movie.name}
          className="w-12 h-16 rounded object-cover"
        />
        <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold bg-primary text-primary-foreground rounded">
          {getSourceLabel(source)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.origin_name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {movie.year} · {movie.episode_current}
        </p>
      </div>
    </Link>
  );
};

export default MovieCardSeach;
