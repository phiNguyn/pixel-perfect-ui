"use client";

import { Play, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryTrendingMovies } from "@/lib/api/trending/trendingQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getImageSrc } from "../../../services/uploadFile";
import { cn } from "@/lib/utils";
import type { TrendingMovie } from "@/lib/api/viewLog/viewLogInterface";

function formatEpisodeLabel(current?: string, total?: string, status?: string) {
  if (!current) return null;
  if (status === "completed") return current;
  if (total) return `${current} / ${total}`;
  return current;
}

// Mobile: 16:9 theo chiều ngang + vùng text/CTA (~64px)
const HERO_MOBILE_POSTER_HEIGHT = "h-[calc(56.25vw+64px)]";
// Desktop: full viewport trừ header + khoảng peek content bên dưới
const HERO_DESKTOP_HEIGHT = "h-[calc(100svh-128px)]";

function HeroMovieMeta({
  movie,
  className,
}: {
  movie: TrendingMovie;
  className?: string;
}) {
  const episodeLabel = formatEpisodeLabel(
    movie.episodeCurrent,
    movie.episodeTotal,
    movie.status,
  );

  return (
    <div className={cn("space-y-1", className)}>
      {movie.originalName && (
        <p className="text-muted-foreground italic font-medium line-clamp-1 text-sm md:text-lg">
          {movie.originalName}
        </p>
      )}
      {episodeLabel && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span
            className={cn(
              "px-2.5 py-1 backdrop-blur-md text-[10px] md:text-xs font-bold rounded uppercase tracking-widest",
              "bg-background/40 border border-border/60 text-foreground/80",
            )}
          >
            {episodeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

type BannerImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  fill?: boolean;
};

const loadedImageUrls = new Set<string>();

function markImageLoaded(src: string) {
  loadedImageUrls.add(src);
}

function isImageCached(src: string, img?: HTMLImageElement | null) {
  return (
    loadedImageUrls.has(src) || Boolean(img?.complete && img.naturalHeight > 0)
  );
}

function BannerImage({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  fetchPriority,
  fill = false,
}: BannerImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(() => loadedImageUrls.has(src));

  useLayoutEffect(() => {
    if (isImageCached(src, imgRef.current)) {
      markImageLoaded(src);
      setLoaded(true);
      return;
    }

    setLoaded(false);
  }, [src]);

  const handleLoad = () => {
    markImageLoaded(src);
    setLoaded(true);
  };

  return (
    <div className={cn("relative w-full h-full", fill && "absolute inset-0")}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}

export default function HeroBanner() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { data: trendingMovies, isLoading } = useQueryTrendingMovies(
    "trending",
    8,
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

  useEffect(() => {
    if (!trendingMovies) return;

    trendingMovies.forEach((movie) => {
      const thumb = movie.movieThumb;
      if (!thumb || loadedImageUrls.has(thumb)) return;

      const img = new Image();
      img.onload = () => markImageLoaded(thumb);
      img.src = thumb;
    });
  }, [trendingMovies]);

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden bg-muted/10">
        <div className="md:hidden">
          <Skeleton className={HERO_MOBILE_POSTER_HEIGHT} />
          <div className="mt-4 flex justify-center gap-2.5 px-5 py-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="size-8 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className={`hidden md:block w-full ${HERO_DESKTOP_HEIGHT}`} />
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
            drag="x"
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const threshold = 60;
              if (info.offset.x < -threshold || info.velocity.x < -400) {
                scroll("right");
              } else if (info.offset.x > threshold || info.velocity.x > 400) {
                scroll("left");
              }
            }}
            className="relative touch-pan-y"
          >
            {/* Poster image */}
            <div
              className={`relative w-full ${HERO_MOBILE_POSTER_HEIGHT} overflow-hidden`}
            >
              {activeMovie.movieThumb ? (
                <BannerImage
                  src={activeMovie.movieThumb}
                  alt={activeMovie.movieTitle || "Movie poster"}
                  width={1080}
                  height={1350}
                  loading="eager"
                  fetchPriority="high"
                  fill
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
              )}
              {/* Gradient overlay for fade into content */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
              {/* content */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-2 text-center space-y-2 w-full">
                <h2 className="w-full font-bold leading-tight tracking-tight text-xl text-foreground drop-shadow-2xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-primary">
                    {activeMovie.movieTitle || "Không có tiêu đề"}
                  </span>
                </h2>

                <HeroMovieMeta movie={activeMovie} className="px-1" />

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    onClick={() =>
                      router.push(
                        `/phim/${activeMovie.movieId}?source=${activeMovie.source}`,
                      )
                    }
                    size="icon"
                    className="rounded-full gap-2 bg-gradient-to-r from-primary to-primary/85 hover:from-primary hover:to-primary text-primary-foreground px-1.5 py-1 text-sm font-bold shadow-2xl shadow-primary/30 transition-transform"
                  >
                    <Play className="size-3.5 fill-current" />
                  </Button>
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
                  <span className="flex items-center gap-1 text-primary">
                    <Star className="size-3.5 fill-current" />
                    <span className="font-bold text-md">
                      {activeMovie.viewCount ?? "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail circles - outside AnimatePresence so they don't slide */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 scrollbar-hide overflow-x-auto scroll-smooth mt-4 px-5 py-4 justify-center"
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
                key={`${movie.movieId}-${movie.source}-m`}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                onClick={() => selectMovie(index)}
                className={`size-8 relative shrink-0 cursor-pointer rounded-full overflow-hidden transition-all duration-300 bg-muted ${
                  isActive
                    ? "ring-2 ring-primary scale-110"
                    : "opacity-50 border border-border/40"
                }`}
              >
                <BannerImage
                  src={getImageSrc(movie.moviePoster, movie.source)}
                  alt={movie.movieTitle || "Movie thumbnail"}
                  width={96}
                  height={96}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div
        className={`hidden md:block relative ${HERO_DESKTOP_HEIGHT} overflow-hidden`}
      >
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
              <BannerImage
                src={activeMovie.movieThumb}
                alt={activeMovie.movieTitle || "Movie poster"}
                width={1920}
                height={1080}
                loading="eager"
                fetchPriority="high"
                fill
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
              <div className="max-w-xl lg:max-w-2xl space-y-2">
                <h2 className="font-bold leading-[1.05] tracking-tight text-foreground drop-shadow-2xl md:text-2xl lg:text-5xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-primary/80">
                    {activeMovie.movieTitle || "Không có tiêu đề"}
                  </span>
                </h2>

                <HeroMovieMeta movie={activeMovie} />

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

        <div className="absolute md:bottom-2 lg:bottom-6 left-auto ml-auto mr-0 z-20 px-14 lg:px-20 right-0">
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
                  className={`md:w-12 md:h-16 xl:w-16 xl:h-24 relative shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all duration-500 ${
                    isActive
                      ? "ring-2 ring-primary"
                      : "opacity-50 hover:opacity-100 border border-border/40 hover:border-primary/50"
                  }`}
                >
                  <BannerImage
                    src={getImageSrc(movie.moviePoster, movie.source)}
                    alt={movie.movieTitle || "Movie thumbnail"}
                    width={64}
                    height={96}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
