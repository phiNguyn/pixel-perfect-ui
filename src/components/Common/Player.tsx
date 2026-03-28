"use client";

import { Episode, IMovieDetail } from "@/lib/api/movies/movieInterface";
import MoviePlayer from "./MoviePlayer";

interface PlayerProps {
    episode: Episode;
    movie: IMovieDetail;
    startTime?: number;
    onEpisodeChange?: (episode: Episode) => void;
}

export default function Player({ episode, movie, startTime, onEpisodeChange }: PlayerProps) {
    const posterUrl = movie?.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://img.ophim.live/uploads/movies/${movie?.poster_url}`;

    return (
        <div className="w-full">
            <MoviePlayer
                src={episode.link_m3u8}
                title={movie.name}
                poster={posterUrl}
                selectedEp={episode.name}
                startTime={startTime}
            />
        </div>
    );
}