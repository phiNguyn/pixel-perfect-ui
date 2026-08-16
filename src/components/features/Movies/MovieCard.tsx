"use client";

import { Play, Star } from "lucide-react";
import Link from "next/link";
import { Movie } from "@/lib/api/movies/movieInterface";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

interface MovieCardProps {
  movie: Movie;
  rank?: number;
  className?: string;
  listName?: string;
  position?: number;
  source?: string;
}

const serverNameMap: Record<string, string> = {
  vietsub: "PĐ",
  "subteam #1": "PĐ",
  "lồng tiếng": "LT",
  "long tieng": "LT",
  "thuyết minh": "TM",
  "thuyet minh": "TM",
};

const getEpisodeBadge = (serverName: string, episodeName: string): string => {
  const cleanEpisode = episodeName.replace(/^Tập\s*/i, "");
  const lowerName = serverName.toLowerCase();
  for (const [key, value] of Object.entries(serverNameMap)) {
    if (lowerName.includes(key)) {
      return `${value}.${cleanEpisode}`;
    }
  }
  return cleanEpisode;
};

import MovieImage from "./MovieImage";
export default function MovieCard({
  movie,
  rank,
  className,
  listName,
  position,
  source = "phimapi",
}: MovieCardProps) {
  const handleClick = () => {
    analytics.movieClick({
      movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
      movie_title: movie.name,
      movie_slug: movie.slug,
      source: source,
      position: position || 0,
      list_name: listName,
    });
  };

  const rating = movie?.tmdb?.vote_average;
  const country = movie?.country?.[0]?.name;
  const latestEpisode = movie?.last_episodes?.[0];

  return (
    <Link
      href={`/phim/${movie.slug}?source=${source}`}
      onClick={handleClick}
      aria-label={movie.name}
      className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div
        className={cn(
          "relative flex-shrink-0 w-[140px] md:w-[170px] group cursor-pointer",
          "transition-transform duration-300 ease-out will-change-transform hover:scale-[1.04] active:scale-[0.98]",
          className,
        )}
      >
        {rank !== undefined && (
          <div
            className="absolute -left-3 -bottom-2 z-10 text-6xl font-black text-foreground/20 leading-none select-none"
            style={{ WebkitTextStroke: "2px hsl(var(--primary))" }}
          >
            {rank}
          </div>
        )}

        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/40 ring-1 ring-border/40 shadow-[var(--shadow-card)]">
          <MovieImage movie={movie} source="phimapi" />

          {/* Hover / focus overlay */}
          <div className="absolute inset-0 bg-background/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </span>
          </div>

          {/* Top badges: quality (left) + episode (right) */}
          {movie.quality && (
            <span className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm text-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-md ring-1 ring-border/40">
              {movie.quality}
            </span>
          )}
          {(movie.episode_current === "Trailer" || latestEpisode) && (
            <span className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-md ring-1 ring-border/40">
              {movie.episode_current === "Trailer"
                ? "Trailer"
                : getEpisodeBadge(latestEpisode.server_name, latestEpisode.name)}
            </span>
          )}
        </div>

        <h3 className="mt-2 text-[13px] md:text-sm font-medium text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">
          {movie.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
          {rating ? (
            <span className="flex items-center gap-0.5 text-foreground/80">
              <Star className="w-3 h-3 fill-current text-primary" />
              {rating}
            </span>
          ) : null}
          {movie.year ? <span>{movie.year}</span> : null}
          {country ? (
            <span className="truncate hidden sm:inline">{country}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
