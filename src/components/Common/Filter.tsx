/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Filter as FilterIcon, Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useQueryCategories } from "@/lib/api/categories/categorieQuery"
import { useQueryMovies } from "@/lib/api/movies/movieQuery"
import type { Country } from "@/lib/api/movies/movieInterface"
import { ItemQueryField } from "@/hooks/useQueryResult"

interface OrderFilterProps {
    getFilterValue: (key: string, type?: 'string' | 'array') => any;
    addQuery: (params: ItemQueryField) => void;
    clearAll: () => void
}



export const Filter: FC<OrderFilterProps> = ({
    addQuery,
    getFilterValue,
    clearAll
}) => {
    const { slug, type } = useParams()
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()

    const { data, isLoading } = useQueryCategories()
    const categories = data?.data?.items ?? []

    const { data: countries, isLoading: countryLoading } = useQueryMovies<{ data: { items: Country[] } }>(
        {},
        true,
        "quoc-gia",
        "quoc-gia",
    )

    const selectedCategories = (typeof getFilterValue === "function"
        ? (getFilterValue("category", "array") as string[])
        : []) ?? []

    const selectedCountries = (typeof getFilterValue === "function"
        ? (getFilterValue("country", "array") as string[])
        : []) ?? []

    const toggleCategory = (categorySlug: string) => {
        const next = selectedCategories.includes(categorySlug)
            ? selectedCategories.filter((s) => s !== categorySlug)
            : [...selectedCategories, categorySlug]

        addQuery({
            key: "category",
            value: next.join(","),
            query: next.length ? `category=${next.join(",")}` : "",
        })
    }

    const toggleCountry = (countrySlug: string) => {
        const next = selectedCountries.includes(countrySlug)
            ? selectedCountries.filter((s) => s !== countrySlug)
            : [...selectedCountries, countrySlug]

        addQuery({
            key: "country",
            value: next.join(","),
            query: next.length ? `country=${next.join(",")}` : "",
        })
    }

    const handleClearAll = () => {
        clearAll()
        setOpen(false)
    }

    return (
        isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button size="sm" className="my-2">
                        <FilterIcon />
                        Bộ lọc
                    </Button>
                </DrawerTrigger>

                <DrawerContent className="p-0 max-h-[70dvh] overflow-hidden">
                    <DrawerHeader className="border-b border-border/50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <DrawerTitle className="text-foreground font-bold text-lg tracking-tight">Bộ lọc</DrawerTitle>
                            <Button size="sm" variant="ghost" onClick={handleClearAll}>
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </DrawerHeader>

                    <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                        {/* Categories */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-foreground">Thể loại</h3>
                            <div className="flex flex-wrap gap-2">
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    categories
                                        ?.filter((cat: { slug: string }) => cat.slug !== "phim-18")
                                        .map((cat: { _id: string; name: string; slug: string }) => (
                                            <DrawerClose asChild key={cat._id}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.slug)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                            ${selectedCategories.includes(cat.slug) || (type === "the-loai" && slug === cat.slug)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            </DrawerClose>
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
                                        <DrawerClose asChild key={c.slug}>
                                            <button
                                                type="button"
                                                onClick={() => toggleCountry(c.slug)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                          ${selectedCountries.includes(c.slug) || (type === "quoc-gia" && slug === c.slug)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                                                    }`}
                                            >
                                                {c.name}
                                            </button>
                                        </DrawerClose>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        ) : (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button size="sm" className="my-2">
                        <FilterIcon />
                        Bộ lọc
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-full sm:w-[350px] p-0 overflow-y-auto">
                    <SheetHeader className="border-b border-border/50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <SheetTitle className="text-foreground font-bold text-lg tracking-tight">Bộ lọc</SheetTitle>
                            <Button size="sm" variant="default" onClick={handleClearAll}>
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </SheetHeader>

                    <div className="p-4 flex flex-col gap-4">
                        {/* Categories */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-foreground">Thể loại</h3>
                            <div className="flex flex-wrap gap-2">
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    categories
                                        ?.filter((cat: { slug: string }) => cat.slug !== "phim-18")
                                        .map((cat: { _id: string; name: string; slug: string }) => (
                                            <SheetClose asChild key={cat._id}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.slug)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                            ${selectedCategories.includes(cat.slug) || (type === "the-loai" && slug === cat.slug)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            </SheetClose>
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
                                        <SheetClose asChild key={c.slug}>
                                            <button
                                                type="button"
                                                onClick={() => toggleCountry(c.slug)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors 
                          ${selectedCountries.includes(c.slug) || (type === "quoc-gia" && slug === c.slug)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                                                    }`}
                                            >
                                                {c.name}
                                            </button>
                                        </SheetClose>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        )
    )
}

