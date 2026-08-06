"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/features/Movies/MovieCard";
import { PaginationBase } from "@/components/layouts/Pagination";
import { SkeletonCard } from "@/components/features/Movies/Skeletons/SkeletonCard";
import BreadCrumb from "@/components/Common/BreadCrumb";
import { Filter } from "@/components/Common/Filter";
import useQueryResult from "@/hooks/useQueryResult";
import { useQueryMovies } from "@/lib/api/movies/movieQuery";
import { MoviesListResponse } from "@/lib/api/server";

interface MoviesListClientProps {
  type: string;
  slug: string;
  initialPage: number;
}

function MoviesListContent({ type, slug, initialPage }: MoviesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read page from URL using Next.js useSearchParams (properly synced with router)
  const currentPage = useMemo(() => {
    const urlPage = searchParams.get("page");
    if (urlPage) {
      const parsed = parseInt(urlPage, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return initialPage;
  }, [searchParams, initialPage]);

  // Save page to sessionStorage when navigating away (for back navigation)
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`page_${slug}`, String(currentPage));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPage, slug]);

  // Read saved page from sessionStorage on mount (for back navigation)
  const savedPage = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`page_${slug}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return currentPage;
  }, [slug]);

  const { queryResult, setPage, addQuery, clearAll, getFilterValue } =
    useQueryResult({
      page: savedPage,
      limit: 24,
      queryMode: "flat",
      syncUrl: true,
    });

  const { data, isLoading } = useQueryMovies<MoviesListResponse>(
    queryResult!,
    true,
    "movies",
    type + "/" + slug,
    true,
  );

  const {
    items = [],
    pagination,
    breadCrumb,
  } = useMemo(() => {
    const responseData = data?.data;
    return {
      items: responseData?.items ?? [],
      pagination: responseData?.params?.pagination,
      breadCrumb: responseData?.breadCrumb,
    };
  }, [data]);

  // Redirect if trying to access restricted content
  useEffect(() => {
    if (slug === "phim-18") {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace("/"); // hoặc "/phim"
      }
    }
  }, [slug, router]);
  const handlePagechange = (page: number) => {
    setPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="px-4 md:px-16 mt-16 mx-auto py-6">
      <div className="px-2 flex justify-between items-center gap-2">
        <BreadCrumb breadCrumb={breadCrumb} />

        <div className="flex justify-end mt-4">
          <Filter
            clearAll={clearAll}
            addQuery={addQuery}
            getFilterValue={getFilterValue}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 md:gap-4 items-stretch">
        {isLoading ? (
          <SkeletonCard className="!w-full h-[230px] md:h-[320px]" count={24} />
        ) : items.length > 0 ? (
          items
            .filter(
              (item) =>
                !item.category?.some((category) => category.slug === "phim-18"),
            )
            .map((item) => (
              <MovieCard
                source="phimapi"
                movie={item as any}
                key={item._id}
                className="!w-full"
              />
            ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Không tìm thấy phim nào
          </div>
        )}
      </div>

      {pagination && pagination.totalItems > 0 && (
        <div className="mt-8">
          <PaginationBase
            current={pagination.currentPage}
            pageSize={pagination.totalItemsPerPage}
            total={pagination.totalItems}
            pageRanges={4}
            onChange={handlePagechange}
          />
        </div>
      )}
    </div>
  );
}

export default function MoviesListClient({
  type,
  slug,
  initialPage,
}: MoviesListClientProps) {
  return (
    <MoviesListContent type={type} slug={slug} initialPage={initialPage} />
  );
}
