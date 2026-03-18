import { Search, Bell, User, Menu, Loader, XIcon } from "lucide-react";
import { useState } from "react";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import { Link, useParams } from "react-router-dom";
import { useQueryMovies, useQuerySearchMovie } from "@/lib/api/movies/movieQuery";
import useDebounce from "@/hooks/useDebounce";
import { Skeleton } from "../ui/skeleton";
import { Country, Movie } from "@/lib/api/movies/movieInterface";
import MovieCardSeach from "../features/Movies/MovieCardSeach";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import BadgeSkeleton from "../features/Movies/Skeletons/BadgeSkeleton";
import SearchHistoryList from "../features/Home/SearchHistoryList";

export default function SiteHeader() {
  const { slug } = useParams()
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const { data, isLoading } = useQueryCategories()
  const { items } = data?.data || []
  const [search, setSearch] = useState('')
  const value = useDebounce(search, 500)
  const mobileSearchValue = useDebounce(mobileSearch, 500)
  const { data: searchMovie, isLoading: searchLoaing, isFetching: searchFetching } =
    useQuerySearchMovie<{ data: { items: Movie[] } }>(value)
  const { data: mobileSearchMovie, isLoading: mobileSearchLoading, isFetching: mobileSearchFetching } =
    useQuerySearchMovie<{ data: { items: Movie[] } }>(mobileSearchValue)
  const { data: countries, isLoading: countryLoading } = useQueryMovies<{ data: { items: Country[] } }>(
    {},
    true,
    'quoc-gia',
    'quoc-gia'
  )

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to={'/'} className="flex items-center gap-2">
              <Avatar className="size-8 mb-1.5">
                <AvatarImage src={`https://api-sandbox.vnhub.com/resource/2026/02/27/1772203272485-1000003143.png`} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">PF</AvatarFallback>
              </Avatar>
              <span className="text-foreground font-bold text-lg tracking-tight">Pinuss Flix</span>
            </Link>
          </div>
          {/* search */}
          <div className="hidden md:flex items-center gap-1 relative">
            {searchOpen ? (
              <div >
                <input
                  type="text"
                  placeholder="Tìm phim, diễn viên..."
                  className="bg-secondary text-foreground px-4 py-2 rounded-full text-sm w-64 outline-none border border-border focus:border-primary/50 transition-colors"
                  autoFocus
                  onBlur={() => {
                    setTimeout(() => setSearchOpen(false), 200)
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </button>

          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap">Tìm đang xem gì?</span>
          {isLoading ? <BadgeSkeleton count={10} /> :
            items?.filter((cat) => cat.slug !== 'phim-18').map((cat, i) => (
              <Link to={`/the-loai/${cat.slug}`}
                key={cat._id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                ${cat.slug === slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }
                `}
              >
                {cat.name}
              </Link>
            ))
          }
        </nav>

        {/* Sub navigation */}
        <div className="hidden md:flex items-center gap-4 pb-2 text-xs">
          <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap">Quốc gia:</span>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {countryLoading ? <Skeleton className="h-4 w-full" /> : countries?.data?.items.map((c: Country) => (
              <Link
                to={`/quoc-gia/${c.slug}`} key={c.slug}
                className={`text-secondary-foreground hover:text-primary transition-colors whitespace-nowrap `}>{c.name}</Link>
            ))}
          </div>
        </div>
      </div>
      {search && searchOpen && (
        <div className="absolute top-14 right-5 flex flex-col gap-4 max-h-[80dvh] overflow-auto w-[300px] bg-background p-6 rounded-lg " onClick={(e) => e.stopPropagation()}>
          {searchLoaing || searchFetching ? (
            <div>Đang tìm...</div>
          ) : searchMovie?.data?.items?.length > 0 ? (
            searchMovie.data.items.map(item => (
              <MovieCardSeach movie={item} key={item._id} />
            ))
          ) : (
            <div>Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} >
        <SheetContent side="right" className="w-full sm:w-[350px] p-0 overflow-y-auto">
          <SheetHeader className="border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <Link onClick={() => {
                setMobileMenuOpen(false);
                setMobileSearch('');
              }} to={'/'} className="flex items-center gap-2">
                <Avatar className="size-8 mb-1.5">
                  <AvatarImage src={`https://api-sandbox.vnhub.com/resource/2026/02/27/1772203272485-1000003143.png`} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">PF</AvatarFallback>
                </Avatar>
                <SheetTitle className="text-foreground font-bold text-lg tracking-tight">
                  Pinuss Flix
                </SheetTitle>
              </Link>
            </div>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm phim, diễn viên..."
                className="bg-secondary text-foreground px-4 py-3 pr-10 rounded-lg text-sm w-full outline-none border border-border focus:border-primary/50 transition-colors"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
              />
              {mobileSearchValue ? <XIcon onClick={() => setMobileSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"></XIcon> : <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
            </div>

            {/* Mobile Search Results */}
            {mobileSearch && (
              <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto bg-secondary/50 rounded-lg p-3">
                {mobileSearchLoading || mobileSearchFetching ? (
                  <div className="flex w-full max-w-xs flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : mobileSearchMovie?.data?.items?.length > 0 ? (
                  <div className="flex flex-col gap-2" onClick={() => {
                    setMobileSearch('')
                    setMobileMenuOpen(false)
                  }}>
                    {
                      mobileSearchMovie.data.items.map(item => (
                        <MovieCardSeach movie={item} key={item.slug} />
                      ))

                    }
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có kết quả</div>
                )}
              </div>
            )}

            {/* User Actions */}
            {/* <div className="flex items-center gap-2 py-2 border-b border-border/50">
              <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="text-sm">Thông báo</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm">Tài khoản</span>
              </button>
            </div> */}

            {/* Categories */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Thể loại</h3>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  items?.filter((cat) => cat.slug !== 'phim-18').map((cat) => (
                    <Link
                      to={`/the-loai/${cat.slug}`}
                      key={cat._id}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                        ${cat.slug === slug
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Countries */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Quốc gia</h3>
              <div className="flex flex-wrap gap-2">
                {countryLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  countries?.data?.items?.map((c) => (
                    <Link
                      to={`/quoc-gia/${c.slug}`}
                      key={c.slug}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                        ${c.slug === slug
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                    >
                      {c.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
