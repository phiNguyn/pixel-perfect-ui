/* eslint-disable @typescript-eslint/no-explicit-any */
import fallback from "@/assets/fallback.png";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MovieImageProps {
  movie: any;
  source?: "ophim" | "phimapi";
  variant?: "portrait" | "landscape";
  className?: string;
}

export default function MovieImage({
  movie,
  source,
  variant = "portrait",
  className,
}: MovieImageProps) {
  const getImageSrc = () => {
    if (!movie) return fallback.src;

    if (source === "phimapi") {
      // Landscape dùng thumb_url
      if (variant === "landscape" && movie.thumb_url) {
        return movie.thumb_url.startsWith("http")
          ? movie.thumb_url
          : `https://phimimg.com/${movie.thumb_url}`;
      }
      // Default: poster_url
      return movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;
    }

    // ophim
    if (movie.thumb_url?.startsWith("http")) return movie.thumb_url;
    if (movie.thumb_url?.includes("uploads/movies/")) {
      return `https://img.ophim.live/${movie.thumb_url}`;
    }
    return `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
  };

  const [imgSrc, setImgSrc] = useState(getImageSrc());
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Placeholder giữ chỗ + hiệu ứng shimmer trong lúc ảnh tải */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/40" />
      )}
      <img
        width={variant === "landscape" ? 1280 : 400}
        height={variant === "landscape" ? 720 : 600}
        src={imgSrc}
        alt={movie?.name || "Movie"}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          variant === "portrait" && "group-hover:scale-110",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setImgSrc(fallback.src);
          setLoaded(true);
        }}
      />
    </>
  );
}
