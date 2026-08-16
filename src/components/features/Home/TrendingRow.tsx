"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useQueryTrendingMovies } from "@/lib/api/trending/trendingQuery";
import { MovieRowSkeleton, SectionHeader } from "../Movies/MovieRow";
import { TrendingMovie } from "@/lib/api/viewLog/viewLogInterface";
import fallback from "@/assets/fallback.png";

const posterUrl = (poster?: string | null) => {
  if (!poster) return fallback.src;
  if (poster.startsWith("http")) return poster;
  return `https://img.ophim.live/uploads/movies/${poster}`;
};

function TrendingCard({ movie, rank }: { movie: TrendingMovie; rank: number }) {
  return (
    <Link
      href={`/phim/${movie.movieId}?source=${movie.source || "ophim"}`}
      aria-label={movie.movieTitle || movie.movieId}
      className="group snap-start flex-shrink-0 flex items-end gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span
        aria-hidden
        className="text-[64px] md:text-[86px] leading-[0.75] font-black text-transparent select-none -mr-2 md:-mr-3"
        style={{ WebkitTextStroke: "2px hsl(var(--primary) / 0.7)" }}
      >
        {rank}
      </span>
      <div className="w-[34vw] min-w-[112px] max-w-[150px] md:w-[150px]">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/40 ring-1 ring-border/40 transition-transform duration-300 group-hover:scale-[1.04]">
          <img
            src={posterUrl(movie.moviePoster)}
            alt={movie.movieTitle || "Movie"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </span>
          </div>
        </div>
        <h3 className="mt-2 text-[13px] md:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {movie.movieTitle || movie.movieId}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate">
          {[movie.year, movie.quality].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

export default function TrendingRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useQueryTrendingMovies(undefined, 12);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 320);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (isError || (!isLoading && (!data || data.length === 0))) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeader
          title="🔥 Đang thịnh hành"
          subtitle="Được xem nhiều nhất trên Pinuss Flix"
        />
        <div className="relative group/row">
          <button
            type="button"
            aria-label="Cuộn sang trái"
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-2 top-[38%] -translate-y-1/2 z-20 w-9 h-16 bg-background/85 backdrop-blur-sm rounded-lg items-center justify-center ring-1 ring-border/50 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
          >
            {isLoading ? (
              <MovieRowSkeleton count={6} />
            ) : (
              data?.map((movie, i) => (
                <TrendingCard
                  key={movie.movieId}
                  movie={movie}
                  rank={i + 1}
                />
              ))
            )}
          </div>

          <button
            type="button"
            aria-label="Cuộn sang phải"
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-2 top-[38%] -translate-y-1/2 z-20 w-9 h-16 bg-background/85 backdrop-blur-sm rounded-lg items-center justify-center ring-1 ring-border/50 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
