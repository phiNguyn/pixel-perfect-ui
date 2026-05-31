"use client";

import { Play, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryTrendingMovies } from "@/lib/api/trending/trendingQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getImageSrc } from "../../../services/uploadFile";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

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

  const scroll = (dir: "left" | "right") => {
    if (!trendingMovies || trendingMovies.length === 0) return;
    let newIndex = activeIndex;
    if (dir === "left") {
      newIndex = activeIndex > 0 ? activeIndex - 1 : trendingMovies.length - 1;
    } else {
      newIndex = activeIndex < trendingMovies.length - 1 ? activeIndex + 1 : 0;
    }
    setDirection(dir === "left" ? -1 : 1);
    setActiveIndex(newIndex);
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
      <section className="relative w-full h-[70vh] md:h-[calc(100vh-128px)] overflow-hidden bg-muted/10">
        <Skeleton className="absolute inset-0" />
      </section>
    );
  }

  if (!trendingMovies || trendingMovies.length === 0) {
    return (
      <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-muted-foreground">
        <p>Không có phim trending</p>
      </section>
    );
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 1.02 }),
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeMovie.movieId + activeMovie.source + "-m"}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Poster image */}
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              {activeMovie.movieThumb ? (
                <Image
                  quality={100}
                  src={activeMovie.movieThumb}
                  alt={activeMovie.movieTitle || "Movie poster"}
                  className="w-full h-full object-cover"
                  width={1080}
                  height={1350}
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
              )}
              {/* Gradient overlay for fade into content */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Content below poster */}
            <div className="relative -mt-16 px-5 pb-6 text-center space-y-3">
              <h2 className="font-bold leading-tight tracking-tight text-2xl text-foreground drop-shadow-2xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-primary">
                  {activeMovie.movieTitle || "Không có tiêu đề"}
                </span>
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-extrabold rounded uppercase tracking-[0.2em] shadow-lg shadow-primary/30">
                  Hot
                </span>
                {activeMovie.quality && (
                  <span className="px-2.5 py-1 bg-background/40 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold rounded uppercase tracking-widest">
                    {activeMovie.quality}
                  </span>
                )}
                {activeMovie.year && (
                  <span className="px-2.5 py-1 bg-background/40 backdrop-blur-md border border-border/60 text-foreground/80 text-[10px] font-bold rounded uppercase tracking-widest">
                    {activeMovie.year}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() =>
                    router.push(
                      `/phim/${activeMovie.movieId}?source=${activeMovie.source}`,
                    )
                  }
                  className="rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground px-5 py-5 text-sm font-bold shadow-2xl shadow-primary/30"
                >
                  <Play className="size-4 fill-current" />
                  Xem Ngay
                </Button>
                <button className="w-11 h-11 rounded-2xl bg-background/40 backdrop-blur-md border border-border/60 text-foreground flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail circles - outside AnimatePresence so they don't slide */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 scrollbar-hide overflow-x-auto scroll-smooth px-5 pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {trendingMovies.map((movie, index) => {
            const isActive = activeIndex === index;
            const imgUrl =
              getImageSrc(movie.moviePoster, movie.source) ||
              getImageSrc(movie.movieThumb, movie.source);
            return (
              <div
                key={`${movie.movieId}-${movie.source}-m`}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                onClick={() => selectMovie(index)}
                className={`w-12 h-12 relative shrink-0 cursor-pointer rounded-full overflow-hidden transition-all duration-300 bg-muted ${
                  isActive
                    ? "ring-2 ring-primary scale-110"
                    : "opacity-50 border border-border/40"
                }`}
              >
                {imgUrl ? (
                  <Image
                    width={96}
                    height={96}
                    src={imgUrl}
                    alt={movie.movieTitle || "Movie thumbnail"}
                    className="w-full h-full object-cover"
                    quality={90}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-3 h-3 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block relative h-[calc(100vh-128px)] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeMovie.movieId + activeMovie.source}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Backdrop */}
            {activeMovie.movieThumb ? (
              <Image
                quality={100}
                src={activeMovie.movieThumb}
                alt={activeMovie.movieTitle || "Movie poster"}
                className="w-full h-full object-cover"
                width={1920}
                height={1080}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
            )}

            {/* Cinematic layered gradients + vignette for deeper edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 35%, hsl(var(--background) / 0.85) 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end pb-24 px-14 lg:px-20">
              <div className="max-w-xl lg:max-w-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-extrabold rounded uppercase tracking-[0.2em] shadow-lg shadow-primary/30">
                    Hot
                  </span>
                  {activeMovie.quality && (
                    <span className="px-2.5 py-1 bg-background/40 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold rounded uppercase tracking-widest">
                      {activeMovie.quality}
                    </span>
                  )}
                  {activeMovie.year && (
                    <span className="px-2.5 py-1 bg-background/40 backdrop-blur-md border border-border/60 text-foreground/80 text-[10px] font-bold rounded uppercase tracking-widest">
                      {activeMovie.year}
                    </span>
                  )}
                </div>

                <h2 className="font-bold leading-[1.05] tracking-tight text-foreground drop-shadow-2xl text-5xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-primary/80">
                    {activeMovie.movieTitle || "Không có tiêu đề"}
                  </span>
                </h2>

                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-primary">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">
                      {activeMovie.viewCount ?? "—"}
                    </span>
                  </span>
                  {activeMovie.year && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
                      <span>{activeMovie.year}</span>
                    </>
                  )}
                  {activeMovie.quality && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
                      <span className="border border-border/60 px-1.5 rounded text-[10px] uppercase">
                        {activeMovie.quality}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() =>
                      router.push(
                        `/phim/${activeMovie.movieId}?source=${activeMovie.source}`,
                      )
                    }
                    className="rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary/85 hover:from-primary hover:to-primary text-primary-foreground px-4 py-6 text-base font-bold shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-transform"
                  >
                    <Play className="size-5 fill-current" />
                    Xem Ngay
                  </Button>
                  <button className="w-14 h-14 rounded-2xl bg-background/40 hover:bg-background/60 backdrop-blur-md border border-border/60 hover:border-primary/50 text-foreground flex items-center justify-center transition-all hover:scale-105">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-background/40 hover:bg-background/70 border border-border/60 hover:border-primary/50 text-foreground items-center justify-center backdrop-blur-md transition-all hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-background/40 hover:bg-background/70 border border-border/60 hover:border-primary/50 text-foreground items-center justify-center backdrop-blur-md transition-all hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-auto ml-auto mr-0 z-20 px-14 lg:px-20 right-0">
          <div
            className="flex gap-2.5 scrollbar-hide overflow-x-auto scroll-smooth ml-auto py-2.5 px-1.5"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {trendingMovies.map((movie, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={`${movie.movieId}-${movie.source}-d`}
                  onClick={() => selectMovie(index)}
                  className={`w-16 h-24 relative shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all duration-500 ${
                    isActive
                      ? "ring-2 ring-primary"
                      : "opacity-50 hover:opacity-100 border border-border/40 hover:border-primary/50"
                  }`}
                >
                  {movie.movieThumb || movie.moviePoster ? (
                    <Image
                      width={64}
                      height={96}
                      src={getImageSrc(movie.moviePoster, movie.source)}
                      alt={movie.movieTitle || "Movie thumbnail"}
                      className="w-full h-full object-cover"
                      quality={100}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <Play className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

