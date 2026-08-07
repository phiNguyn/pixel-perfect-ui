"use client";

import Link from "next/link";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import BaseDrawer from "./BaseDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import fallback from "@/assets/fallback.png";
import type { Country } from "@/lib/api/movies/movieInterface";
import { categories as categoriesData } from "@/data/movies";

type Category = {
  _id: string;
  slug: string;
  name: string;
};

type MobileBrowseSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  categoriesLoading?: boolean;
  countries?: Country[];
  countriesLoading?: boolean;
};

export default function MobileBrowseSheet({
  open,
  onOpenChange,
  categories,
  categoriesLoading,
  countries,
  countriesLoading,
}: MobileBrowseSheetProps) {
  const { slug } = useParams();

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Khám phá"
      contentClassName="p-0 max-h-[85dvh] overflow-hidden"
      customHeader={
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={fallback.src} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              PF
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground font-bold text-lg tracking-tight">
            Khám phá
          </span>
        </div>
      }
    >
      <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Thể loại</h3>
          <div className="flex flex-wrap gap-2">
            {categoriesLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              categories
                ?.filter((cat) => cat.slug !== "phim-18")
                .map((cat) => (
                  <Link
                    href={`/the-loai/${cat.slug}`}
                    key={cat._id}
                    onClick={() => onOpenChange(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
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

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Quốc gia</h3>
          <div className="flex flex-wrap gap-2">
            {countriesLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              countries?.map((c) => (
                <Link
                  href={`/quoc-gia/${c.slug}`}
                  key={c.slug}
                  onClick={() => onOpenChange(false)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
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

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Danh sách</h3>
          <div className="grid grid-cols-2 gap-2">
            {categoriesData?.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  href={`/danh-sach/${cat.key}`}
                  key={cat.key}
                  onClick={() => onOpenChange(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    cat.key === slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
}
