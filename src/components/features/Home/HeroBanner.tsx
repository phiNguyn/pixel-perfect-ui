"use client";

import { Play, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryNguoncGetMovie } from "@/lib/api/nguonc/nguonc.query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQueryPhimApi } from "@/lib/api/movies/movieQuery";
import { convertPhimApiToIMovieDetail } from "@/lib/api/movies/movieInterface";
import { useMemo } from "react";
import MovieNotFound from "../Movies/MovieNotFound";

export default function HeroBanner() {
  const {
    data,
    isError,
    isLoading: isLoadingPhimApi,
    isSuccess,
  } = useQueryPhimApi("vi-me-anh-phan-chia-tay", true);

  const movie = useMemo(() => {
    if (isSuccess) {
      return data ? convertPhimApiToIMovieDetail(data) : undefined;
    }
  }, [isSuccess, data]);

  const router = useRouter();
  if (isError)
    return <MovieNotFound type="error" slug="vi-me-anh-phan-chia-tay" />;
  return (
    <section className="relative my-4 w-full h-[420px] md:h-[calc(100vh-64px)]  overflow-hidden">
      {isLoadingPhimApi ? (
        <Skeleton className="w-full h-full px-6 py-4" />
      ) : (
        <>
          <img
            loading="lazy"
            width={1920}
            height={1080}
            src={movie?.thumb_url || ""}
            alt={movie?.name + " - Ảnh bìa phim"}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-wrap gap-2  text-xs text-muted-foreground">
                  <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Hot
                  </span>
                  {movie.quality && (
                    <span className="px-2 py-0.5 bg-muted rounded">
                      {movie.quality}
                    </span>
                  )}
                  {movie.lang && (
                    <span className="px-2 py-0.5 bg-muted rounded">
                      {movie.lang}
                    </span>
                  )}
                  {movie.time && (
                    <span className="px-2 py-0.5 bg-muted rounded">
                      {movie.time}
                    </span>
                  )}
                  {movie.episode_current && (
                    <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground rounded">
                      {movie.episode_current} / {movie.episode_total}
                    </span>
                  )}
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                {movie.name}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {movie.origin_name}
              </p>
              <p className="text-[10px] md:text-sm text-secondary-foreground mb-4 w-full leading-relaxed">
                {movie?.actor.map((item) => item).join(", ")}
              </p>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    router.push(`/phim/${movie?.slug}?source=phimapi`)
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Xem luôn
                </Button>
                <button className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors backdrop-blur-sm">
                  <Plus className="w-4 h-4" />
                  Theo dõi
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}
