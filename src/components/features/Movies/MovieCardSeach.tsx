"use client";

import { Movie } from '@/lib/api/movies/movieInterface'
import { FC } from 'react'
import Link from 'next/link'
import { useHistoryStore } from '@/stores/useHistoryStore'

interface MovieCardSeachProps {
    movie: Movie
    onSelect?: () => void
}
const MovieCardSeach: FC<MovieCardSeachProps> = ({ movie, onSelect }) => {
    const { addSearchHistory } = useHistoryStore();

    const handleClick = () => {
        addSearchHistory({
            slug: movie.slug,
            name: movie.name,
            thumb_url: movie.thumb_url,
            year: movie.year,
            episode_current: movie.episode_current,
            searchedAt: Date.now(),
        });
        onSelect?.();
    };

    return (
        <Link href={`/phim/${movie.slug}`} onClick={handleClick} className="flex items-center gap-3 group cursor-pointer">
            <img
                src={`https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
                alt={movie.name}
                className="w-12 h-16 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {movie.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                    {movie.year} · {movie.country.map((item) => item.name)}
                </p>
                {movie.episode_current && (
                    <p className="text-[10px] text-muted-foreground">{movie.episode_current}</p>
                )}
            </div>
        </Link>
    )
}

export default MovieCardSeach