"use client";
import { Search, Bell, User, Menu, Loader, XIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryMovies, useQueryPhimApiSearchMovie, useQuerySearchMovie } from "@/lib/api/movies/movieQuery";
import useDebounce from "@/hooks/useDebounce";
import { Skeleton } from "../ui/skeleton";
import { Country, Movie, SearchMovie } from "@/lib/api/movies/movieInterface";
import MovieCardSeach from "../features/Movies/MovieCardSeach";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BadgeSkeleton from "../features/Movies/Skeletons/BadgeSkeleton";
import SearchHistoryList from "../features/Home/SearchHistoryList";
import AvatarComponent from "../Common/Avatar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import Empty from "../Common/Empty";
import fallback from "@/assets/fallback.png";
export default function SiteHeader() {
  const { slug } = useParams()
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, isLoading } = useQueryCategories()
  const { items } = data?.data || []
  const [search, setSearch] = useState('')
  const value = useDebounce(search, 500)
  const { data: searchMovie, isLoading: searchLoaing, isFetching: searchFetching } =
    useQuerySearchMovie<{ data: { items: Movie[] } }>(value)
  const { data: phimApiSearchMovie, isLoading: phimApiSearchLoading, isFetching: phimApiSearchFetching } =
    useQueryPhimApiSearchMovie<{ data: { items: Movie[] } }>(value)
  const { data: countries, isLoading: countryLoading } = useQueryMovies<{ data: { items: Country[] } }>(
    {},
    true,
    'quoc-gia',
    'quoc-gia'
  )
  const searchMovieData: SearchMovie[] = [
    ...(phimApiSearchMovie?.data?.items || []).map(item => ({ ...item, source: "phimapi" as const })),
    ...(searchMovie?.data?.items || []).map(item => ({ ...item, source: "ophim" as const })),
  ]

  return (
    <header className="py-2 sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <AvatarComponent />
            <div className="hidden md:flex items-center gap-2 ">
              {/* Thể loại dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="secondary">
                    Thể loại
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {isLoading ? (
                    <div className="p-2 grid grid-cols-4 gap-2">
                      <BadgeSkeleton count={4} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4 p-2">
                      {items?.filter((cat) => cat.slug !== 'phim-18').map((cat) => (
                        <DropdownMenuItem key={cat._id} asChild>
                          <Link
                            href={`/the-loai/${cat.slug}`}
                            className={`cursor-pointer text-xs px-2 py-1.5 rounded text-center ${cat.slug === slug ? "bg-primary text-accent-foreground" : "hover:bg-primary"}`}
                          >
                            {cat.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quốc gia dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="secondary">
                    Quốc gia
                    <ChevronDown className="w-3  h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[480px]">
                  {countryLoading ? (
                    <div className="p-2 grid grid-cols-4 gap-2">
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {countries?.data?.items?.map((c: Country) => (
                        <DropdownMenuItem key={c.slug} asChild >
                          <Link
                            href={`/quoc-gia/${c.slug}`}
                            className={`cursor-pointer text-xs px-2 py-1.5 rounded text-center ${c.slug === slug ? "bg-accent text-accent-foreground" : "hover:bg-accent"}`}
                          >
                            {c.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* search */}
          <div className="hidden md:flex items-center gap-1">
            {searchOpen ? (
              <div className="relative">
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
                {searchOpen && (
                  <div className="absolute top-14 left-0 flex flex-col gap-4 max-h-[80dvh] w-[300px] bg-background p-4 rounded-lg border border-border/50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" onClick={(e) => e.stopPropagation()}>
                    {search && value ? (
                      searchLoaing || searchFetching || phimApiSearchLoading || phimApiSearchFetching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : searchMovieData.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {searchMovieData.filter(item => !item.category.some(cat => cat.slug === "phim-18")).map(item => (
                            <MovieCardSeach movie={item} source={item.source} key={`${item.source}-${item._id}`} onSelect={() => { setSearch(''); setSearchOpen(false); }} />
                          ))}
                        </div>
                      ) : (
                        <Empty icon={Search} title="Không tìm thấy" description={`Không có kết quả cho "${value}"`} />
                      )
                    ) : (
                      <SearchHistoryList onSelect={() => { setSearch(''); setSearchOpen(false); }} />
                    )}
                  </div>
                )}
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

      </div>


      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} >
        <SheetContent side="right" className="w-full sm:w-[350px] p-0">
          <SheetHeader className="border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <Link onClick={() => {
                setMobileMenuOpen(false);
                setSearch('');
              }} href={'/'} className="flex items-center gap-2">
                <Avatar className="size-8 mb-1.5">
                  <AvatarImage src={fallback.src} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">PF</AvatarFallback>
                </Avatar>
                <SheetTitle className="text-foreground font-bold text-lg tracking-tight">
                  Pinuss Flix
                </SheetTitle>
              </Link>
            </div>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-4 overflow-y-auto" style={{ height: 'calc(100dvh - 72px)' }}>
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm phim, diễn viên..."
                className="bg-secondary text-foreground px-4 py-3 pr-10 rounded-lg text-sm w-full outline-none border border-border focus:border-primary/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search ? <XIcon onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"></XIcon> : <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
            </div>

            {/* Mobile Search Results */}
            {search ? (
              <div className="flex flex-col gap-3">
                {searchLoaing || searchFetching || phimApiSearchLoading || phimApiSearchFetching ? (
                  <div className="flex w-full max-w-xs flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : searchMovieData.length > 0 ? (
                  <div className="flex flex-col gap-2" onClick={() => {
                    setSearch('')
                    setMobileMenuOpen(false)
                  }}>
                    {searchMovieData.filter(item => !item.category.some(cat => cat.slug === "phim-18")).map(item => (
                      <MovieCardSeach movie={item} source={item.source} key={`${item.source}-${item._id}`} onSelect={() => { setSearch(''); setMobileMenuOpen(false); }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có kết quả</div>
                )}
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-lg p-3">
                <SearchHistoryList onSelect={() => { setSearch(''); setMobileMenuOpen(false); }} />
              </div>
            )

            }

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
                      href={`/the-loai/${cat.slug}`}
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
                      href={`/quoc-gia/${c.slug}`}
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