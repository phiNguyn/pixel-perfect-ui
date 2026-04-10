import Image from "next/image";
import fallback from "@/assets/fallback.png";
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
    return movie.thumb_url.startsWith("http")
      ? movie.thumb_url
      : `https://img.ophim.live/uploads/movies/${movie.thumb_url}?w=1920&q=75`;
  };

  const [imgSrc, setImgSrc] = useState(getImageSrc());

  return (
    <img
      width={1920}
      height={1080}
      src={imgSrc}
      // quality={80}
      alt={movie.name}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      loading="lazy"
      onError={() => setImgSrc(fallback.src)}
    />
  );
}
