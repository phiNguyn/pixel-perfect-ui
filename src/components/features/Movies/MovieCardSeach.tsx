import { Movie } from '@/lib/api/movies/movieInterface'
import { FC } from 'react'
import { Link } from 'react-router-dom'
interface MovieCardSeachProps {
    movie: Movie
}
const MovieCardSeach: FC<MovieCardSeachProps> = ({ movie }) => {
    return (
        <Link to={`/phim/${movie.slug}`} className="flex items-center gap-3 group cursor-pointer">
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