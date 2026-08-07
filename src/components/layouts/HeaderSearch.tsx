"use client";

import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import Empty from "@/components/Common/Empty";
import MovieCardSeach from "@/components/features/Movies/MovieCardSeach";
import SearchHistoryList from "@/components/features/Home/SearchHistoryList";
import type { SearchMovie } from "@/lib/api/movies/movieInterface";

type HeaderSearchProps = {
  isOpen: boolean;
  search: string;
  debouncedSearch: string;
  results: SearchMovie[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onClose: () => void;
};

export function HeaderSearch({
  isOpen,
  search,
  debouncedSearch,
  results,
  isLoading,
  onSearchChange,
  onClose,
}: HeaderSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredResults = results.filter(
    (item) => !item.category.some((cat) => cat.slug === "phim-18"),
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Tìm phim, diễn viên..."
        className="bg-secondary text-foreground px-4 py-2 rounded-full text-sm w-64 outline-none border border-border focus:border-primary/50 transition-colors"
        autoFocus
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      {isOpen && (
        <div
          className="absolute top-14 left-0 flex flex-col gap-4 max-h-[80dvh] w-[300px] bg-background p-4 rounded-lg border border-border/50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          {search && debouncedSearch ? (
            isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredResults.map((item) => (
                  <MovieCardSeach
                    movie={item}
                    source={item.source}
                    key={`${item.source}-${item._id}`}
                    onSelect={() => {
                      onSearchChange("");
                      onClose();
                    }}
                  />
                ))}
              </div>
            ) : (
              <Empty
                icon={Search}
                title="Không tìm thấy"
                description={`Không có kết quả cho "${debouncedSearch}"`}
              />
            )
          ) : (
            <SearchHistoryList
              onSelect={() => {
                onSearchChange("");
                onClose();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
