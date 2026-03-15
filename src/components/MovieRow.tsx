import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/data/movies";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
}

export default function MovieRow({ title, movies, showRank }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
          <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
            Xem thêm <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative group/row max-w-[1400px] mx-auto px-4">
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
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} rank={showRank ? i + 1 : undefined} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-background/80 backdrop-blur-sm rounded-l-lg flex items-center justify-center text-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
