"use client";

import { Play, Heart, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryTrendingMovies } from "@/lib/api/trending/trendingQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroBanner() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: trendingMovies, isLoading } = useQueryTrendingMovies(
    "trending",
    10,
  );

  const activeMovie = trendingMovies?.[activeIndex];

  const scroll = (direction: "left" | "right") => {
    if (!trendingMovies || trendingMovies.length === 0) return;

    let newIndex = activeIndex;
    if (direction === "left") {
      newIndex = activeIndex > 0 ? activeIndex - 1 : trendingMovies.length - 1;
    } else {
      newIndex = activeIndex < trendingMovies.length - 1 ? activeIndex + 1 : 0;
    }

    setDirection(direction === "left" ? -1 : 1);
    setActiveIndex(newIndex);

    // Scroll thumbnail into view
    thumbnailRefs.current[newIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const selectMovie = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Auto-play slideshow every 8 seconds
  useEffect(() => {
    if (!trendingMovies || trendingMovies.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) =>
        prev < trendingMovies.length - 1 ? prev + 1 : 0,
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [trendingMovies]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[400px] md:h-[480px] lg:h-[680px] overflow-hidden bg-muted/20">
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20">
          <div className="flex gap-2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-14 h-8 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!trendingMovies || trendingMovies.length === 0) {
    return (
      <section className="relative w-full h-[400px] md:h-[480px] lg:h-[680px] overflow-hidden">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Không có phim trending</p>
        </div>
      </section>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Main Banner */}
      <div className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeMovie.movieId + activeMovie.source}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            {activeMovie.movieThumb ? (
              <img
                src={activeMovie.movieThumb}
                alt={activeMovie.movieTitle || "Movie poster"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-16 inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
              <div className="max-w-xl lg:max-w-2xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    Hot
                  </span>
                  {activeMovie.quality && (
                    <span className="px-2.5 py-1 bg-muted/90 text-muted-foreground text-xs font-medium rounded">
                      {activeMovie.quality}
                    </span>
                  )}
                  {activeMovie.year && (
                    <span className="px-2.5 py-1 bg-muted/90 text-muted-foreground text-xs font-medium rounded">
                      {activeMovie.year}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  {activeMovie.movieTitle || "Không có tiêu đề"}
                </h2>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/phim/${activeMovie.movieId}?source=${activeMovie.source}`,
                      )
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground md:px-6 md:py-2.5 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Xem ngay
                  </Button>
                  <button className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 text-white  items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 text-white  items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Movie Slider - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:translate-x-0 z-20">
          {/* Navigation Arrows for Slider */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll("left");
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll("right");
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Thumbnails */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 pl-6 pr-6 py-2 bg-black/60 backdrop-blur-md rounded-xl overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              maxWidth: "calc(100vw - 100px)",
            }}
          >
            {trendingMovies.map((movie, index) => (
              <div
                key={`${movie.movieId}-${movie.source}`}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectMovie(index);
                }}
                className={`relative shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden ${
                  activeIndex === index
                    ? "w-16 h-10 md:w-20 md:h-12 ring-2 ring-primary"
                    : "w-14 h-8 md:w-16 md:h-10 opacity-60 hover:opacity-100"
                }`}
              >
                {movie.movieThumb ? (
                  <img
                    src={movie.movieThumb}
                    alt={movie.movieTitle || "Movie thumbnail"}
                    className="w-full h-full object-cover"
                  />
                ) : movie.moviePoster ? (
                  <img
                    src={movie.moviePoster}
                    alt={movie.movieTitle || "Movie thumbnail"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Play className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}

                {/* Active indicator */}
                {activeIndex === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
