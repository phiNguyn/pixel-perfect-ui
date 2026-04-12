"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/features/Movies/MovieCard";
import { PaginationBase } from "@/components/layouts/Pagination";
import { SkeletonCard } from "@/components/features/Movies/Skeletons/SkeletonCard";
import BreadCrumb from "@/components/Common/BreadCrumb";
import { Filter } from "@/components/Common/Filter";
import { ItemQueryField } from "@/hooks/useQueryResult";
import { MoviesListResponse } from "@/lib/api/server";

type BreadCrumbItem = {
  name: string;
  slug?: string;
  isCurrent: boolean;
  position: number;
};

type MoviesPagination = {
  currentPage: number;
  totalItemsPerPage: number;
  totalItems: number;
};

interface MoviesListClientProps {
  type: string;
  slug: string;
  initialData: MoviesListResponse["data"] | null;
  initialPage: number;
}

export default function MoviesListClient({
  type,
  slug,
  initialData,
  initialPage,
}: MoviesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Redirect if trying to access restricted content
  useEffect(() => {
    if (slug === "phim-18") {
      router.back();
    }
  }, [slug, router]);

  // Fetch data when page or filters change
  const fetchData = useCallback(
    async (page: number, filterParams: Record<string, string> = {}) => {
      setIsLoading(true);
      try {
        const queryString = new URLSearchParams({
          page: page.toString(),
          ...filterParams,
        }).toString();

        const response = await fetch(
          `/api/movies/${type}/${slug}?${queryString}`,
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [type, slug],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL with new page
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/${type}/${slug}?${params.toString()}`, { scroll: false });

    fetchData(page, filters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addQuery = (params: ItemQueryField) => {
    const { key, value } = params;
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    const urlParams = new URLSearchParams(searchParams.toString());
    if (value) {
      urlParams.set(key, value);
    } else {
      urlParams.delete(key);
    }
    urlParams.set("page", "1");
    router.push(`/${type}/${slug}?${urlParams.toString()}`, { scroll: false });

    fetchData(1, newFilters);
  };

  const getFilterValue = (key: string, filterType?: "string" | "array") => {
    const value = filters[key] || searchParams.get(key) || "";
    if (filterType === "array" && value) {
      return value.split(",");
    }
    return value;
  };

  const clearAll = () => {
    setFilters({});
    setCurrentPage(1);
    router.push(`/${type}/${slug}`, { scroll: false });
    fetchData(1, {});
  };

  const { items = [], params, breadCrumb } = data ?? {};
  const { pagination } = params ?? {};

  return (
    <div className="px-8 mt-16 mx-auto  py-6">
      <BreadCrumb breadCrumb={breadCrumb} />

      <div className="w-full flex justify-end mt-4">
        <Filter
          clearAll={clearAll}
          addQuery={addQuery}
          getFilterValue={getFilterValue}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 items-stretch">
        {isLoading ? (
          <SkeletonCard className="!w-full h-[320px] w" count={24} />
        ) : items.length > 0 ? (
          items.map((item) => (
            <MovieCard movie={item as any} key={item._id} className="!w-full" />
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
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
