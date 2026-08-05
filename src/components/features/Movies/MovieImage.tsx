/* eslint-disable @typescript-eslint/no-explicit-any */
import fallback from "@/assets/fallback.png";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MovieImage({
  movie,
  source,
}: {
  movie: any;
  source?: "ophim" | "phimapi";
}) {
  const getImageSrc = () => {
    if (!movie?.thumb_url) return fallback.src;
    if (source === "phimapi") {
      return movie.poster_url.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;
    }
    if (movie.thumb_url.startsWith("http")) return movie.thumb_url;
    if (movie.thumb_url.includes("uploads/movies/")) {
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
        width={1920}
        height={1080}
        src={imgSrc}
        alt={movie.name}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
          loaded ? "opacity-100" : "opacity-0",
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
