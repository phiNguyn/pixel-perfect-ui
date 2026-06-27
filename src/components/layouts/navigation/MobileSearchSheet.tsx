"use client";

import { Search, XIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import MovieCardSeach from "@/components/features/Movies/MovieCardSeach";
import SearchHistoryList from "@/components/features/Home/SearchHistoryList";
import Empty from "@/components/Common/Empty";
import type { Movie, SearchMovie } from "@/lib/api/movies/movieInterface";

type MobileSearchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  debouncedSearch: string;
  results: SearchMovie[];
  isLoading: boolean;
};

export default function MobileSearchSheet({
  open,
  onOpenChange,
  search,
  onSearchChange,
  debouncedSearch,
  results,
  isLoading,
}: MobileSearchSheetProps) {
  const closeSearch = () => {
    onSearchChange("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90dvh] rounded-t-2xl p-0">
        <SheetHeader className="border-b border-border/50 p-4">
          <SheetTitle className="text-foreground font-bold text-lg tracking-tight">
            Tìm kiếm
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 flex flex-col gap-4" style={{ height: "calc(90dvh - 72px)" }}>
          <div className="relative shrink-0">
            <input
              type="text"
              placeholder="Tìm phim, diễn viên..."
              className="bg-secondary text-foreground px-4 py-2.5 pr-10 rounded-full text-sm w-full outline-none border border-border focus:border-primary/50 transition-colors"
              autoFocus={open}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <XIcon className="w-4 h-4" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {search && debouncedSearch ? (
              isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                results
                  .filter(
                    (item) =>
                      !item.category.some((cat) => cat.slug === "phim-18"),
                  )
                  .map((item) => (
                    <MovieCardSeach
                      movie={item as Movie}
                      source={item.source}
                      key={`sheet-${item.source}-${item._id}`}
                      onSelect={closeSearch}
                    />
                  ))
              ) : (
                <Empty
                  icon={Search}
                  title="Không tìm thấy"
                  description={`Không có kết quả cho "${debouncedSearch}"`}
                />
              )
            ) : (
              <SearchHistoryList onSelect={closeSearch} />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
