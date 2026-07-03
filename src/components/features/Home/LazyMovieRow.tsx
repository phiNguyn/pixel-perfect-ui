"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import MovieRow from "@/components/features/Movies/MovieRow";
import { useQueryMovies } from "@/lib/api/movies/movieQuery";
import useQueryResult from "@/hooks/useQueryResult";
import { useInView } from "@/hooks/useInView";

interface LazyMovieRowProps {
  title: string;
  /** queryKey cho react-query (thường trùng slug). */
  cacheKey: string;
  /** slug endpoint để gọi API. */
  slug: string;
  type?: string;
  showRank?: boolean;
}

/**
 * Bọc MovieRow lại và chỉ kích hoạt việc gọi API khi hàng phim
 * này được cuộn tới gần viewport. Nhờ đó trang chủ không gọi tất cả
 * API cùng lúc lúc tải trang -> giảm tải mạng và tăng tốc first paint.
 */
export default function LazyMovieRow({
  title,
  cacheKey,
  slug,
  type,
  showRank,
}: LazyMovieRowProps) {
  const { queryResult } = useQueryResult({ limit: 10, page: 1 });
  const isReady = queryResult?.q === "";

  // Prefetch sớm 300px trước khi vào màn hình cho trải nghiệm mượt.
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "300px" });

  const { data, isLoading } = useQueryMovies(
    queryResult,
    isReady && inView,
    cacheKey,
    slug,
  );
  const movieData = data as any;

  return (
    <div ref={ref}>
      <MovieRow
        title={title}
        movies={movieData?.data?.items}
        loading={!inView || isLoading}
        type={type}
        showRank={showRank}
        type_list={movieData?.data?.type_list}
      />
    </div>
  );
}
