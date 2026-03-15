import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Movie } from "@/data/movies";

interface MovieCardProps {
  movie: Movie;
  rank?: number;
}

export default function MovieCard({ movie, rank }: MovieCardProps) {
  return (
    <Link to={`/phim/${movie.id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative flex-shrink-0 w-[140px] md:w-[170px] group cursor-pointer"
      >
        {rank !== undefined && (
          <div className="absolute -left-3 -bottom-2 z-10 text-6xl font-black text-foreground/20 leading-none select-none" style={{ WebkitTextStroke: "2px hsl(var(--primary))" }}>
            {rank}
          </div>
        )}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)]">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>
          {movie.episodes && (
            <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
              {movie.episodes}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="flex items-center gap-1 text-yellow-400 text-[10px]">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{movie.rating}</span>
            </div>
          </div>
        </div>
        <h3 className="mt-2 text-xs font-medium text-foreground line-clamp-2 leading-snug">{movie.title}</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">{movie.year} · {movie.country}</p>
      </motion.div>
    </Link>
  );
}
