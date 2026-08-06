"use client";
import NotificationBell from "@/components/layouts/navigation/NotificationBell";
import StreakBadgeButton from "@/components/features/Streak/StreakBadgeButton";
import { Search, ArrowLeft, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categories } from "@/data/movies";
import {
  useQueryMovies,
  useQueryPhimApiSearchMovie,
  useQuerySearchMovie,
} from "@/lib/api/movies/movieQuery";
import useDebounce from "@/hooks/useDebounce";
import { Country, Movie, SearchMovie } from "@/lib/api/movies/movieInterface";
import MovieCardSeach from "../features/Movies/MovieCardSeach";
import BadgeSkeleton from "../features/Movies/Skeletons/BadgeSkeleton";
import SearchHistoryList from "../features/Home/SearchHistoryList";
import AvatarComponent from "../Common/Avatar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Empty from "../Common/Empty";
import { ThemeSelector } from "../theme/ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import SiteBottomNav from "@/components/layouts/navigation/SiteBottomNav";
import MobileBrowseSheet from "@/components/layouts/navigation/MobileBrowseSheet";
import MobileSearchSheet from "@/components/layouts/navigation/MobileSearchSheet";
import MobileAccountSheet from "@/components/layouts/navigation/MobileAccountSheet";
import UserAccountMenuContent from "@/components/layouts/navigation/UserAccountMenuContent";
import {
  getActiveMobileNavId,
  type MobileNavId,
} from "@/components/layouts/navigation/siteNavItems";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [browseSheetOpen, setBrowseSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
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
  const isSearchLoading =
    searchLoaing ||
    searchFetching ||
    phimApiSearchLoading ||
    phimApiSearchFetching;

  const openMobilePanel = searchSheetOpen
    ? "search"
    : browseSheetOpen
      ? "explore"
      : accountSheetOpen
        ? "account"
        : null;
  const activeMobileNavId = getActiveMobileNavId(pathname, openMobilePanel);

  const openMobileSheet = (panel: MobileNavId) => {
    setSearchSheetOpen(panel === "search");
    setBrowseSheetOpen(panel === "explore");
    setAccountSheetOpen(panel === "account");
  };

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowBackButton = !isHomePage;

  return (
    <>
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
              <div className="hidden md:flex items-center gap-2.5 ">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        aria-label="Thể loại"
                        className="h-9 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 data-[state=open]:bg-secondary/80 data-[active]:bg-secondary/80"
                      >
                        Thể loại
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {isLoading ? (
                          <div className="p-2 grid grid-cols-4 gap-2 w-[480px]">
                            <BadgeSkeleton count={4} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-1 p-2 w-[480px]">
                            {items
                              ?.filter((cat) => cat.slug !== "phim-18")
                              .map((cat) => (
                                <NavigationMenuLink key={cat._id} asChild>
                                  <Link
                                    href={`/the-loai/${cat.slug}`}
                                    className={`cursor-pointer text-sm px-2 py-1.5 rounded text-left ${cat.slug === slug ? "bg-accent text-accent-foreground" : "hover:bg-accent"}`}
                                  >
                                    {cat.name}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                          </div>
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        aria-label="Quốc gia"
                        className="h-9 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 data-[state=open]:bg-secondary/80 data-[active]:bg-secondary/80"
                      >
                        Quốc gia
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {countryLoading ? (
                          <div className="p-2 w-[480px]">
                            <BadgeSkeleton count={4} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-1 p-2 w-[480px]">
                            {countries?.data?.items?.map((c: Country) => (
                              <NavigationMenuLink key={c.slug} asChild>
                                <Link
                                  href={`/quoc-gia/${c.slug}`}
                                  className={`cursor-pointer text-sm px-2 py-1.5 rounded text-left ${c.slug === slug ? "bg-accent text-accent-foreground" : "hover:bg-accent"}`}
                                >
                                  {c.name}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        aria-label="Danh sách"
                        className="h-9 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 data-[state=open]:bg-secondary/80 data-[active]:bg-secondary/80"
                      >
                        Danh sách
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid grid-cols-4 gap-1 p-2 w-[600px]">
                          {categories?.map((c) => {
                            const Icon = c.icon;
                            return (
                              <NavigationMenuLink key={c.key} asChild>
                                <Link
                                  href={`/danh-sach/${c.key}`}
                                  className={`cursor-pointer text-sm px-2 py-1.5 rounded text-left flex items-center gap-2 ${c.key === slug ? "bg-accent text-accent-foreground" : "hover:bg-accent"}`}
                                >
                                  <Icon className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{c.label}</span>
                                </Link>
                              </NavigationMenuLink>
                            );
                          })}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

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
                        isSearchLoading ? (
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
              <StreakBadgeButton />
              <NotificationBell />
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
                    <UserAccountMenuContent user={user} onLogout={logout} />
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

            <div className="md:hidden flex items-center gap-0.5">
              <StreakBadgeButton />
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <SiteBottomNav
        activeId={activeMobileNavId}
        onSearchClick={() => openMobileSheet("search")}
        onExploreClick={() => openMobileSheet("explore")}
        onAccountClick={() => openMobileSheet("account")}
      />

      <MobileBrowseSheet
        open={browseSheetOpen}
        onOpenChange={setBrowseSheetOpen}
        categories={items}
        categoriesLoading={isLoading}
        countries={countries?.data?.items}
        countriesLoading={countryLoading}
      />

      <MobileSearchSheet
        open={searchSheetOpen}
        onOpenChange={setSearchSheetOpen}
        search={search}
        onSearchChange={setSearch}
        debouncedSearch={value}
        results={searchMovieData}
        isLoading={isSearchLoading}
      />

      <MobileAccountSheet
        open={accountSheetOpen}
        onOpenChange={setAccountSheetOpen}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={openLoginModal}
        onLogout={logout}
      />
    </>
  );
}
