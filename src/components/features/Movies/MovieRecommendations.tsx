"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useQueryRecommendationsByCategory,
  useQueryRecommendationsByCountry,
} from "@/lib/api/recommendations/recommendationsQuery";
import { RecommendationItem } from "@/lib/api/recommendations/recommendationsInterface";
import { Movie } from "@/lib/api/movies/movieInterface";
import MovieCard from "./MovieCard";

interface MovieRecommendationsProps {
  movieSlug: string;
  movieName: string;
  categories: { id: string; name: string; slug: string }[];
  countries: { id: string; name: string; slug: string }[];
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  movie,
  source = "ophim",
}: {
  movie: RecommendationItem | Movie;
  source?: string;
}) {
  const imageUrl = movie.thumb_url?.startsWith("http")
    ? movie.thumb_url
    : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;

  return (
    <Link href={`/phim/${movie.slug}?source=${source}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={movie.name}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Quality Badge */}
        {movie.quality && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-black/70 text-white border-0"
          >
            {movie.quality}
          </Badge>
        )}

        {/* Episode Badge */}
        {movie.episode_current && (
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 bg-black/70 text-white border-0"
          >
            {movie.episode_current}
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {movie.name}
        </h4>
        <p className="text-xs text-muted-foreground">
          {movie.year}
          {movie.lang && ` · ${movie.lang}`}
        </p>
      </div>
    </Link>
  );
}

function RecommendationSection({
  title,
  icon,
  movies,
  source = "ophim",
}: {
  title: string;
  icon?: string;
  movies: any[] | Movie[];
  source?: string;
}) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 md:gap-4">
        {movies.map((movie) => (
          <MovieCard className="!w-full" key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default function MovieRecommendations({
  movieSlug,
  movieName,
  categories,
  countries,
}: MovieRecommendationsProps) {
  const primaryCategory = categories?.[0];

  const { data: categoryMovies, isLoading: isLoadingCategory } =
    useQueryRecommendationsByCategory(
      primaryCategory?.slug,
      movieSlug,
      12,
      !!primaryCategory?.slug,
    );

  const { data: countryMovies, isLoading: isLoadingCountry } =
    useQueryRecommendationsByCountry(
      countries?.[0]?.slug,
      movieSlug,
      6,
      !!countries?.[0]?.slug,
    );

  const isLoading = isLoadingCategory || isLoadingCountry;

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t">
        <RecommendationSkeleton />
      </div>
    );
  }

  const hasRecommendations =
    (categoryMovies && categoryMovies.length > 0) ||
    (countryMovies && countryMovies.length > 0);

  if (!hasRecommendations) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t space-y-6">
      <RecommendationSection
        title="Phim cùng thể loại"
        icon="🎬"
        movies={categoryMovies || []}
      />

      {countryMovies && countryMovies.length > 0 && (
        <RecommendationSection
          title="Phim cùng quốc gia"
          icon="🌍"
          movies={countryMovies}
        />
      )}
    </div>
  );
}
