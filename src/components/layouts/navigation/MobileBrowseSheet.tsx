"use client";

import Link from "next/link";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import fallback from "@/assets/fallback.png";
import type { Country } from "@/lib/api/movies/movieInterface";

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 max-h-[85dvh] overflow-hidden rounded-t-2xl">
        <DrawerHeader className="border-b border-border/50 p-4 text-left">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={fallback.src} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                PF
              </AvatarFallback>
            </Avatar>
            <DrawerTitle className="text-foreground font-bold text-lg tracking-tight">
              Khám phá
            </DrawerTitle>
          </div>
        </DrawerHeader>

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
        </div>
      </DrawerContent>
    </Drawer>
  );
}
