"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Search, User } from "lucide-react";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import {
  useQueryMovies,
  useQueryPhimApiSearchMovie,
  useQuerySearchMovie,
} from "@/lib/api/movies/movieQuery";
import { Country, Movie, SearchMovie } from "@/lib/api/movies/movieInterface";
import useDebounce from "@/hooks/useDebounce";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import AvatarComponent from "@/components/Common/Avatar";
import StreakBadgeButton from "@/components/features/Streak/StreakBadgeButton";
import NotificationBell from "@/components/layouts/navigation/NotificationBell";
import SiteBottomNav from "@/components/layouts/navigation/SiteBottomNav";
import MobileBrowseSheet from "@/components/layouts/navigation/MobileBrowseSheet";
import MobileSearchSheet from "@/components/layouts/navigation/MobileSearchSheet";
import MobileAccountSheet from "@/components/layouts/navigation/MobileAccountSheet";
import {
  getActiveMobileNavId,
  type MobileNavId,
} from "@/components/layouts/navigation/siteNavItems";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { Button } from "@/components/ui/button";
import { HeaderNavMenus } from "@/components/layouts/HeaderNavMenus";
import { HeaderAuthSection } from "@/components/layouts/HeaderAuthSection";
import { HeaderSearch } from "@/components/layouts/HeaderSearch";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();

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

  const searchMovieData: SearchMovie[] = (() => {
    const seenSlugs = new Set<string>();
    const result: SearchMovie[] = [];

    // Phimapi đứng trước (ưu tiên cao hơn)
    for (const item of phimApiSearchMovie?.data?.items || []) {
      if (!seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        result.push({ ...item, source: "phimapi" as const });
      }
    }
    // Ophim đứng sau, bỏ qua nếu trùng slug với phimapi
    for (const item of searchMovie?.data?.items || []) {
      if (!seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        result.push({ ...item, source: "ophim" as const });
      }
    }

    return result;
  })();

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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowBackButton = !isHomePage;

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full border-b py-2 transition-all duration-300 ${isScrolled ? "border-border/70 bg-background/90 shadow-sm backdrop-blur-xl" : "border-transparent bg-background/10 backdrop-blur-sm"}`}
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

              <div className="hidden md:flex items-center gap-2.5">
                <HeaderNavMenus
                  items={items}
                  isLoading={isLoading}
                  countries={countries?.data?.items}
                  countriesLoading={countryLoading}
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {searchOpen ? (
                <HeaderSearch
                  isOpen={searchOpen}
                  search={search}
                  debouncedSearch={value}
                  results={searchMovieData}
                  isLoading={isSearchLoading}
                  onSearchChange={setSearch}
                  onClose={() => setSearchOpen(false)}
                />
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
              <HeaderAuthSection
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={openLoginModal}
                onLogout={logout}
              />
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
