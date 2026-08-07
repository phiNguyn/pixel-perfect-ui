"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import BadgeSkeleton from "@/components/features/Movies/Skeletons/BadgeSkeleton";
import { categories } from "@/data/movies";
import type { Category, Country } from "@/lib/api/movies/movieInterface";

type HeaderNavMenusProps = {
  items?: Category[];
  isLoading: boolean;
  countries?: Country[];
  countriesLoading: boolean;
};

export function HeaderNavMenus({
  items,
  isLoading,
  countries,
  countriesLoading,
}: HeaderNavMenusProps) {
  const { slug } = useParams();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Thể loại */}
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
                    <NavigationMenuLink key={cat.slug} asChild>
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

        {/* Quốc gia */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            aria-label="Quốc gia"
            className="h-9 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 data-[state=open]:bg-secondary/80 data-[active]:bg-secondary/80"
          >
            Quốc gia
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            {countriesLoading ? (
              <div className="p-2 w-[480px]">
                <BadgeSkeleton count={4} />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1 p-2 w-[480px]">
                {countries?.map((c) => (
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

        {/* Danh sách */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            aria-label="Danh sách"
            className="h-9 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 data-[state=open]:bg-secondary/80 data-[active]:bg-secondary/80"
          >
            Danh sách
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-4 gap-1 p-2 w-[600px]">
              {categories.map((c) => {
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
  );
}
