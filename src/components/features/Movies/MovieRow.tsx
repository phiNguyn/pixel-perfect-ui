"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/api/movies/movieInterface";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
  loading?: boolean;
  type_list?: string;
  type?: string;
  /** Ẩn link "Xem tất cả" khi không có đích đến hợp lệ. */
  href?: string;
  subtitle?: string;
}

export const CARD_WIDTH_CLASS =
  "w-[38vw] min-w-[128px] max-w-[170px] sm:w-[150px] md:w-[170px]";

export function MovieRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("flex-shrink-0 space-y-2", CARD_WIDTH_CLASS)}>
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      ))}
    </>
  );
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
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="text-lg md:text-2xl font-semibold text-foreground tracking-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex-shrink-0 flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors font-medium rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function MovieRow({
  title,
  movies,
  showRank,
  type_list,
  type = "quoc-gia",
  loading,
  href,
  subtitle,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 320);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const seeAllHref = href ?? (type_list ? `/${type}/${type_list}` : undefined);

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1440px] mx-auto">
        <SectionHeader title={title} subtitle={subtitle} href={seeAllHref} />

        <div className="relative group/row">
          <button
            type="button"
            aria-label="Cuộn sang trái"
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-2 top-[38%] -translate-y-1/2 z-20 w-9 h-16 bg-background/85 backdrop-blur-sm rounded-lg items-center justify-center text-foreground ring-1 ring-border/50 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
          >
            {loading ? (
              <MovieRowSkeleton count={6} />
            ) : (
              movies?.map((movie, i) => (
                <div key={movie._id} className="snap-start">
                  <MovieCard
                    movie={movie}
                    rank={showRank ? i + 1 : undefined}
                    listName={title}
                    position={i + 1}
                    className={CARD_WIDTH_CLASS}
                  />
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            aria-label="Cuộn sang phải"
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-2 top-[38%] -translate-y-1/2 z-20 w-9 h-16 bg-background/85 backdrop-blur-sm rounded-lg items-center justify-center text-foreground ring-1 ring-border/50 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
