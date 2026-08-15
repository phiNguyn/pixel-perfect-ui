/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState, useCallback } from "react";
import { Filter as FilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryCategories } from "@/lib/api/categories/categorieQuery";
import {
  useQueryMovies,
  useQueryMoviesWithoutPrefix,
} from "@/lib/api/movies/movieQuery";
import { ItemQueryField } from "@/hooks/useQueryResult";
import { analytics } from "@/lib/analytics";

interface OrderFilterProps {
  getFilterValue: (key: string, type?: "string" | "array") => any;
  addQuery: (params: ItemQueryField) => void;
  clearAll: () => void;
}

// ---------- helpers ----------

type FilterKey = "category" | "country" | "year" | "sort_lang";

// Static sort_lang options
const SORT_LANG_OPTIONS = [
  { slug: "vietsub", name: "Vietsub" },
  { slug: "thuyet-minh", name: "Thuyết minh" },
  { slug: "long-tieng", name: "Lồng tiếng" },
];

const btnClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground hover:bg-muted"
  }`;

const buildToggle =
  (
    selected: string[],
    addQuery: (p: ItemQueryField) => void,
    key: FilterKey,
    trackAnalytics: (
      key: FilterKey,
      value: string,
      action: "add" | "remove",
    ) => void,
  ) =>
  (value: string) => {
    const isAdding = !selected.includes(value);
    trackAnalytics(key, value, isAdding ? "add" : "remove");
    const next = isAdding
      ? [...selected, value]
      : selected.filter((s) => s !== value);
    addQuery({
      key,
      value: next.join(","),
      query: next.length ? `${key}=${next.join(",")}` : "",
    });
  };

// ---------- SkeletonLoading ----------

const SkeletonGroup = ({ count = 4 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-6 w-20" />
    ))}
  </>
);

// ---------- FilterChipRow ----------

interface FilterChipRowProps {
  label: string;
  isLoading: boolean;
  items?: any[];
  selected: string[];
  onToggle: (value: string) => void;
  getValue: (item: any) => string;
  getLabel: (item: any) => React.ReactNode;
  isActive?: (item: any) => boolean;
}

const FilterChipRow: FC<FilterChipRowProps> = ({
  label,
  isLoading,
  items,
  selected,
  onToggle,
  getValue,
  getLabel,
  isActive,
}) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    <div className="flex flex-wrap gap-2">
      {isLoading ? (
        <SkeletonGroup />
      ) : (
        items?.map((item, i) => {
          const value = getValue(item);
          const active =
            (isActive ? isActive(item) : false) || selected.includes(value);
          return (
            <button
              key={item._id ?? item.slug ?? item.year ?? i}
              type="button"
              onClick={() => onToggle(value)}
              className={btnClass(active)}
            >
              {getLabel(item)}
            </button>
          );
        })
      )}
    </div>
  </div>
);

// ---------- FilterContent ----------

interface FilterContentProps {
  categoriesData: ReturnType<typeof useQueryCategories>["data"];
  categoriesLoading: boolean;
  countriesData: any;
  countriesLoading: boolean;
  yearsData: any;
  yearsLoading: boolean;
  selectedCategories: string[];
  selectedCountries: string[];
  selectedYears: string[];
  selectedSortLangs: string[];
  onToggleCategory: (value: string) => void;
  onToggleCountry: (value: string) => void;
  onToggleYear: (value: string) => void;
  onToggleSortLang: (value: string) => void;
  onClearAll?: () => void;
}

const FilterContent: FC<FilterContentProps> = ({
  categoriesData,
  categoriesLoading,
  countriesData,
  countriesLoading,
  yearsData,
  yearsLoading,
  selectedCategories,
  selectedCountries,
  selectedYears,
  selectedSortLangs,
  onToggleCategory,
  onToggleCountry,
  onToggleYear,
  onToggleSortLang,
}) => {
  const categories =
    categoriesData?.data?.items?.filter((c: any) => c.slug !== "phim-18") ?? [];

  return (
    <>
      <FilterChipRow
        label="Thể loại"
        isLoading={categoriesLoading}
        items={categories}
        selected={selectedCategories}
        onToggle={onToggleCategory}
        getValue={(item) => item.slug}
        getLabel={(item) => item.name}
      />

      <FilterChipRow
        label="Quốc gia"
        isLoading={countriesLoading}
        items={countriesData?.data?.items}
        selected={selectedCountries}
        onToggle={onToggleCountry}
        getValue={(item) => item.slug}
        getLabel={(item) => item.name}
      />

      <FilterChipRow
        label="Ngôn ngữ"
        isLoading={false}
        items={SORT_LANG_OPTIONS}
        selected={selectedSortLangs}
        onToggle={onToggleSortLang}
        getValue={(item) => item.slug}
        getLabel={(item) => item.name}
      />

      <FilterChipRow
        label="Năm phát hành"
        isLoading={yearsLoading}
        items={yearsData?.data?.items?.slice(0, 24)}
        selected={selectedYears}
        onToggle={onToggleYear}
        getValue={(item) => item.year?.toString()}
        getLabel={(item) => item.year}
      />
    </>
  );
};

// ---------- Filter ----------

export const Filter: FC<OrderFilterProps> = ({
  addQuery,
  getFilterValue,
  clearAll,
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useQueryCategories();
  const { data: countriesData, isLoading: countriesLoading } = useQueryMovies(
    {},
    true,
    "quoc-gia",
    "quoc-gia",
  );
  const { data: yearsData, isLoading: yearsLoading } =
    useQueryMoviesWithoutPrefix(
      "nam-phat-hanh",
      { limit: 10 },
      true,
      "nam-phat-hanh",
    );

  const selectedCategories =
    (getFilterValue("category", "array") as string[]) ?? [];
  const selectedCountries =
    (getFilterValue("country", "array") as string[]) ?? [];
  const selectedYears = (getFilterValue("year", "array") as string[]) ?? [];
  const selectedSortLangs =
    (getFilterValue("sort_lang", "array") as string[]) ?? [];

  // Analytics tracking function
  const trackFilterAnalytics = useCallback(
    (key: FilterKey, value: string, action: "add" | "remove") => {
      analytics.filter({
        filter_type: key,
        filter_value: value,
        action,
      });
    },
    [],
  );

  // Analytics for clear all
  const handleClearAll = () => {
    const hadFilters =
      selectedCategories.length > 0 ||
      selectedCountries.length > 0 ||
      selectedYears.length > 0 ||
      selectedSortLangs.length > 0;
    if (hadFilters) {
      analytics.filterClear();
    }
    clearAll();
    setOpen(false);
  };

  const onToggleCategory = buildToggle(
    selectedCategories,
    addQuery,
    "category",
    trackFilterAnalytics,
  );
  const onToggleCountry = buildToggle(
    selectedCountries,
    addQuery,
    "country",
    trackFilterAnalytics,
  );
  const onToggleYear = buildToggle(
    selectedYears,
    addQuery,
    "year",
    trackFilterAnalytics,
  );
  const onToggleSortLang = buildToggle(
    selectedSortLangs,
    addQuery,
    "sort_lang",
    trackFilterAnalytics,
  );

  const contentProps = {
    categoriesData,
    categoriesLoading,
    countriesData,
    countriesLoading,
    yearsData,
    yearsLoading,
    selectedCategories,
    selectedCountries,
    selectedYears,
    selectedSortLangs,
    onToggleCategory,
    onToggleCountry,
    onToggleYear,
    onToggleSortLang,
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size="sm" className="my-2">
            <FilterIcon />
            Bộ lọc
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-0 max-h-[90dvh] overflow-hidden">
          <DrawerHeader className="border-b border-border/50 !py-0">
            <div className="flex items-center justify-between gap-3">
              <DrawerTitle className="text-foreground font-bold text-lg tracking-tight">
                Bộ lọc
              </DrawerTitle>
              <Button size="sm" variant="ghost" onClick={handleClearAll}>
                Xóa bộ lọc
              </Button>
            </div>
          </DrawerHeader>
          <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <FilterContent {...contentProps} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="my-2">
          <FilterIcon />
          Bộ lọc
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Bộ lọc</SheetTitle>
        </SheetHeader>
        <div
          style={{ maxHeight: "calc(100vh - 70px)" }}
          className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          <FilterContent {...contentProps} />
        </div>
        <SheetFooter className="p-4">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="link" onClick={() => setOpen(false)}>
              Đóng
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearAll}>
              Xóa bộ lọc
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
