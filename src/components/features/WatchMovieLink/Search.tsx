import useDebounce from "@/hooks/useDebounce";
import { useQueryNguoncSearchMovie } from "@/lib/api/nguonc/nguonc.query";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MovieCardSeach from "../Movies/MovieCardSeach";
import Empty from "@/components/Common/Empty";
import SearchHistoryList from "../Home/SearchHistoryList";
import { Button } from "@/components/ui/button";

const WatchMovieLinkSearch = () => {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const value = useDebounce(search, 500);
  const {
    data: movies,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useQueryNguoncSearchMovie(value);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="flex items-center gap-1">
      {searchOpen ? (
        <div className="relative z-10" ref={wrapperRef}>
          <input
            type="text"
            placeholder="Tìm phim, diễn viên..."
            className="bg-secondary text-foreground px-4 py-2 rounded-full text-sm w-64 outline-none border border-border focus:border-primary/50 transition-colors"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {searchOpen && (
            <div
              className="absolute top-14 left-0 flex flex-col gap-4 max-h-[80dvh] w-[300px] bg-background p-4 rounded-lg border border-border/50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {search && value ? (
                searchLoading || searchFetching || movies?.items?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {movies?.items?.map((item, index) => (
                      <MovieCardSeach
                        movie={item}
                        source={"nguonc"}
                        key={`nguonc-${item._id || index}`}
                        onSelect={() => {
                          setSearch("");
                          setSearchOpen(false);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={Search}
                    title="Không tìm thấy"
                    description={`Không có kết quả cho "${value}"`}
                  />
                )
              ) : (
                <SearchHistoryList
                  source="nguonc"
                  onSelect={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          size="default"
          aria-label="Tìm kiếm"
          name="search"
          onClick={() => setSearchOpen(true)}
          className="w-full text-muted-foreground hover:text-foreground transition-colors"
        >
          Tìm phim <Search className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default WatchMovieLinkSearch;
