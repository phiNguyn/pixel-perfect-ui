"use client";

import { ChevronRight, Play } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/api/movies/movieInterface";
import Link from "next/link";
import { SkeletonCard } from "./Skeletons/SkeletonCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
  loading?: boolean;
  type_list?: string;
  type?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
          Xem thêm <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export function MovieRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-3 md:gap-5 overflow-x-auto pb-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex-shrink-0">
          <SkeletonCard count={1} className="h-[244px] md:h-[313px] !w-full w-[124px] md:w-[150px]" />
        </div>
      ))}
    </div>
  );
}

export const CARD_WIDTH_CLASS = "w-[124px] md:w-[150px]";

export default function MovieRow({
  title,
  movies,
  showRank,
  type_list,
  type = "quoc-gia",
  loading,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="py-4">
        <div className="max-w-[1560px] mx-auto px-0 md:px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            <Link
              href={`/${type}/${type_list}`}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Xem thêm <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative group/row max-w-[1560px] mx-auto px-0 md:px-4">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-background/80 backdrop-blur-sm rounded-r-lg flex items-center justify-center text-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          >
            {loading ? (
              <SkeletonCard
                count={5}
                className="h-[244px] md:h-[313px] !w-full"
              />
            ) : (
              movies?.map((movie, i) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  rank={showRank ? i + 1 : undefined}
                  listName={title}
                  position={i + 1}
                  className="w-[124px]"
                />
              ))
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-background/80 backdrop-blur-sm rounded-l-lg flex items-center justify-center text-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </>
  );
}
