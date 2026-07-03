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
  const lowerName = serverName.toLowerCase();
  for (const [key, value] of Object.entries(serverNameMap)) {
    if (lowerName.includes(key)) {
      return `${value}.${episodeName}`;
    }
  }
  return episodeName;
};

import MovieImage from "./MovieImage";
export default function MovieCard({
  movie,
  rank,
  className,
  listName,
  position,
}: MovieCardProps) {
  const handleClick = () => {
    analytics.movieClick({
      movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
      movie_title: movie.name,
      movie_slug: movie.slug,
      source: "ophim",
      position: position || 0,
      list_name: listName,
    });
  };

  return (
    <Link href={`/phim/${movie.slug}`} onClick={handleClick}>
      <div
        className={cn(
          "relative flex-shrink-0 w-[140px] md:w-[170px] group cursor-pointer",
          "transition-transform duration-200 ease-out will-change-transform hover:scale-105",
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
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <MovieImage movie={movie} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>
          {}
          <>
            <div className="absolute top-2 left-2 flex gap-1">
              {movie.quality && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {movie.quality}
                </span>
              )}
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {movie.episode_current === "Trailer" ? (
                <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {movie.episode_current}
                </span>
              ) : (
                movie.last_episodes.slice(0, 2).map((ep, idx) => (
                  <span
                    key={idx}
                    className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded"
                  >
                    {getEpisodeBadge(ep.server_name, ep.name)}
                  </span>
                ))
              )}
            </div>
          </>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="w-fit flex items-center gap-1 text-yellow-400 text-[10px] bg-background/30 backdrop-blur-sm px-1.5 py-0.5 rounded">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{movie?.tmdb?.vote_average}</span>
            </div>
          </div>
        </div>
        <h3 className="mt-2 text-xs font-medium text-foreground line-clamp-2 leading-snug">
          {movie.name}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {movie.year} · {movie?.country?.map((item) => item.name).join(", ")}
        </p>
      </div>
    </Link>
  );
}
