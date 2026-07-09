"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Movie } from "@/lib/api/movies/movieInterface";
import MovieCard from "./MovieCard";
import { useQueryMovies } from "@/lib/api/movies/movieQuery";

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

function RecommendationSection({
  movies,
  source = "ophim",
}: {
  movies: any[] | Movie[];
  source?: string;
}) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2.5 md:gap-4">
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
  const { data, isLoading } = useQueryMovies(
    {
      category: categories.map((category) => category.slug).join(","),
      limit: 6,
      page: 1,
    },
    true,
    "categoryMovies",
    `quoc-gia/${countries?.[0]?.slug}`,
  );
  const movieData = data as any;

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t">
        <RecommendationSkeleton />
      </div>
    );
  }

  const hasRecommendations =
    movieData?.data?.items && movieData?.data?.items?.length > 0;

  if (!hasRecommendations) {
    return null;
  }

  return <RecommendationSection movies={movieData?.data?.items || []} />;
}
