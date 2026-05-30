"use client";
import {
  Search,
  Bell,
  Menu,
  Loader,
  XIcon,
  ChevronDown,
  ArrowLeft,
  User,
  Settings,
  LogOut,
  History,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useQueryMovies,
  useQueryPhimApiSearchMovie,
  useQuerySearchMovie,
} from "@/lib/api/movies/movieQuery";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import Empty from "../Common/Empty";
import fallback from "@/assets/fallback.png";
import { ThemeSelector } from "../theme/ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useDisclaimerNotice } from "./DisclaimerNotice";
import { useAuth } from "@/components/auth/AuthProvider";
export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { openDisclaimer } = useDisclaimerNotice();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === "/";
  const { data, isLoading } = useQueryCategories();
  const { items } = data?.data || [];
  const [search, setSearch] = useState("");
  const value = useDebounce(search, 500);
  const {
    data: searchMovie,
    isLoading: searchLoaing,
    isFetching: searchFetching,
  } = useQuerySearchMovie<{ data: { items: Movie[] } }>(value);
  const {
    data: phimApiSearchMovie,
    isLoading: phimApiSearchLoading,
    isFetching: phimApiSearchFetching,
  } = useQueryPhimApiSearchMovie<{ data: { items: Movie[] } }>(value);
  const { data: countries, isLoading: countryLoading } = useQueryMovies<{
    data: { items: Country[] };
  }>({}, true, "quoc-gia", "quoc-gia");
  const searchMovieData: SearchMovie[] = [
    ...(phimApiSearchMovie?.data?.items || []).map((item) => ({
      ...item,
      source: "phimapi" as const,
    })),
    ...(searchMovie?.data?.items || []).map((item) => ({
      ...item,
      source: "ophim" as const,
    })),
  ];
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (!mobileSearchRef.current?.contains(event.target as Node)) {
        setMobileResultsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowBackButton = !isHomePage;
  return (
    <header
      className={`
    py-2 max-h-16 fixed w-full top-0 z-50
    transition-all duration-300
    ${
      isScrolled
        ? "bg-background/50 backdrop-blur-md border-b border-border/50"
        : "bg-transparent border-transparent"
    }
  `}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 md:gap-6">
            <AnimatePresence mode="wait">
              {shouldShowBackButton && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Button
                    size="icon"
                    onClick={() => router.back()}
                    aria-label="Quay lại"
                    className="rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <AvatarComponent />
            <div className="hidden md:flex items-center gap-2 ">
              {/* Thể loại dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Thể loại"
                    name="category"
                    size="sm"
                    variant="secondary"
                  >
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
                      {items
                        ?.filter((cat) => cat.slug !== "phim-18")
                        .map((cat) => (
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
                  <Button
                    aria-label="Quốc gia"
                    name="country"
                    size="sm"
                    variant="secondary"
                  >
                    Quốc gia
                    <ChevronDown className="w-3  h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[480px]">
                  {countryLoading ? (
                    <BadgeSkeleton count={4} />
                  ) : (
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {countries?.data?.items?.map((c: Country) => (
                        <DropdownMenuItem key={c.slug} asChild>
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
            <div className="hidden  items-center gap-2">
              <a
                href="https://unikorn.vn/p/pinuss-flix?ref=embed-pinuss-flix"
                target="_blank"
              >
                <img
                  src="https://unikorn.vn/api/widgets/badge/pinuss-flix/rank?theme=light&type=daily"
                  alt="Pinuss Flix - Hàng ngày"
                  style={{ width: "auto", height: "48px" }}
                />
              </a>
              <a
                href="https://unikorn.vn/p/pinuss-flix?ref=embed-pinuss-flix"
                target="_blank"
              >
                <img
                  src="https://unikorn.vn/api/widgets/badge/pinuss-flix/rank?theme=light&type=weekly"
                  alt="Pinuss Flix - Hàng tuần"
                  style={{ width: "auto", height: "48px" }}
                />
              </a>
            </div>
          </div>
          {/* search */}
          <div className="hidden md:flex items-center gap-1">
            {searchOpen ? (
              <div className="relative" ref={wrapperRef}>
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
                      searchLoaing ||
                      searchFetching ||
                      phimApiSearchLoading ||
                      phimApiSearchFetching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : searchMovieData.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {searchMovieData
                            .filter(
                              (item) =>
                                !item.category.some(
                                  (cat) => cat.slug === "phim-18",
                                ),
                            )
                            .map((item) => (
                              <MovieCardSeach
                                movie={item}
                                source={item.source}
                                key={`${item.source}-${item._id}`}
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
              <button
                aria-label="Tìm kiếm"
                name="search"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              aria-label="Thông báo"
              name="notification"
              onClick={() => openDisclaimer()}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <ThemeSelector />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Người dùng"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/watch-histories" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>Lịch sử xem</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={openLoginModal}
                className="ml-2"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}
          </div>
          {/* Mobile Search */}
          <div
            className="flex md:hidden flex-1 mx-2 items-center relative"
            ref={mobileSearchRef}
          >
            <input
              type="text"
              placeholder="Tìm phim..."
              className=" bg-secondary/40 text-foreground px-3 py-1.5 pr-8 rounded-full text-sm w-full outline-none border border-border/10 focus:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMobileResultsOpen(true);
              }}
              onFocus={() => setMobileResultsOpen(true)}
            />
            {search ? (
              <XIcon
                onClick={() => {
                  setSearch("");
                  setMobileResultsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground cursor-pointer"
              />
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            )}

            {/* Mobile Search Results */}
          </div>
          {mobileResultsOpen && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 right-0 w-[80vw] max-h-[70dvh] bg-background rounded-lg border border-border/50 shadow-lg overflow-y-auto z-50 p-3 flex flex-col gap-2">
              {search && value ? (
                searchLoaing ||
                searchFetching ||
                phimApiSearchLoading ||
                phimApiSearchFetching ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchMovieData.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {searchMovieData
                      .filter(
                        (item) =>
                          !item.category.some((cat) => cat.slug === "phim-18"),
                      )
                      .map((item) => (
                        <MovieCardSeach
                          movie={item}
                          source={item.source}
                          key={`mobile-${item.source}-${item._id}`}
                          onSelect={() => {
                            setSearch("");
                            setMobileResultsOpen(false);
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
                  onSelect={() => {
                    setSearch("");
                    setMobileResultsOpen(false);
                  }}
                />
              )}
            </div>
          )}
          <div className="md:hidden flex items-center gap-1 shrink-0">
            <ThemeSelector />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="relative size-6 rounded-full"
                  >
                    <Avatar className="size-6">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Người dùng"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/watch-histories" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>Lịch sử xem</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={openLoginModal}
                className="h-9"
              >
                <User className="w-4 h-4" />
              </Button>
            )}
            <button
              aria-label="Menu"
              name="menu"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:w-[350px] p-0">
          <SheetHeader className="border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <Link
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearch("");
                }}
                href={"/"}
                className="flex items-center gap-2"
              >
                <Avatar className="size-8 mb-1.5">
                  <AvatarImage src={fallback.src} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    PF
                  </AvatarFallback>
                </Avatar>
                <SheetTitle className="text-foreground font-bold text-lg tracking-tight">
                  Pinuss Flix
                </SheetTitle>
              </Link>
            </div>
          </SheetHeader>

          <div
            className="p-4 flex flex-col gap-4 overflow-y-auto"
            style={{ height: "calc(100dvh - 72px)" }}
          >
            {/* Categories */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Thể loại
              </h3>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  items
                    ?.filter((cat) => cat.slug !== "phim-18")
                    .map((cat) => (
                      <Link
                        href={`/the-loai/${cat.slug}`}
                        key={cat._id}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                        ${
                          cat.slug === slug
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
              <h3 className="text-sm font-semibold text-foreground">
                Quốc gia
              </h3>
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
                        ${
                          c.slug === slug
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
