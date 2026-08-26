"use client";

import * as React from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Play, Plus, Star, Clock, Film } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Movie } from "@/lib/api/movies/movieInterface";
import MovieImage from "./MovieImage";
import FavoriteButton from "./FavoriteButton";

interface MoviePreviewProps {
  movie: Movie;
  children: React.ReactNode;
  source?: "ophim" | "phimapi";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export default function MoviePreview({
  movie,
  children,
  source = "phimapi",
  side = "left",
  align = "center",
  sideOffset = 8,
}: MoviePreviewProps) {
  const rating = movie?.tmdb?.vote_average?.toFixed(1) || "N/A";
  const categories = movie.category?.map((c) => c.name).slice(0, 3) || [];
  const countries = movie.country?.map((c) => c.name).join(", ") || "";
  const duration = movie.time || "N/A";
  const quality = movie.quality || "";

  return (
    <HoverCard closeDelay={100} openDelay={200}>
      <HoverCardTrigger render={children} />
      <HoverCardContent
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "z-50 w-96 rounded-xl border bg-card/95 backdrop-blur-md p-0",
            "shadow-2xl shadow-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-4 data-[side=left]:slide-in-from-right-4",
            "data-[side=right]:slide-in-from-left-4 data-[side=top]:slide-in-from-bottom-4",
            "duration-200",
          )}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={16}
        >
          {/* Preview Image - Landscape */}
          <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
            <MovieImage movie={movie} source={source} variant="landscape" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-2 left-2 flex gap-1.5">
              {quality && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {quality}
                </span>
              )}
              {movie.sub_docquyen && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  ĐỘC QUYỀN
                </span>
              )}
            </div>

            {/* Title overlay at bottom of image */}
            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                {movie.name}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Meta row */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {/* Rating */}
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-medium">{rating}</span>
              </div>
              <span className="text-border">|</span>

              {/* Year */}
              <span>{movie.year}</span>
              <span className="text-border">|</span>

              {/* Duration */}
              <div className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                <span>{duration}</span>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Film className="w-3 h-3" />
                <span className="truncate">{categories.join(", ")}</span>
              </div>
            )}

            {/* Countries */}
            {countries && (
              <p className="text-[10px] text-muted-foreground">
                Quốc gia: {countries}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/phim/${movie.slug}?source=${source}`}
                className={cn(
                  "flex items-center justify-center gap-1.5 flex-1",
                  "bg-primary text-primary-foreground text-xs font-semibold",
                  "px-3 py-1.5 rounded-md",
                  "hover:bg-primary/90 transition-colors active:scale-95",
                )}
              >
                <Play className="w-3 h-3 fill-current" />
                Xem ngay
              </Link>

              {/* <button
                className={cn(
                  "flex items-center justify-center w-8 h-8",
                  "border border-input bg-transparent rounded-md",
                  "hover:bg-secondary transition-colors active:scale-95",
                )}
                aria-label="Add to list"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button> */}

              <FavoriteButton
                movieId={movie.slug}
                movieSlug={movie.slug}
                movieTitle={movie.name}
                moviePoster={movie.poster_url}
                movieYear={movie.year}
                movieType={movie.type === "series" ? "series" : "single"}
                source={source}
                size="default"
                className="h-8"
              />
            </div>
          </div>
        </HoverCardContent>
    </HoverCard>
  );
}
