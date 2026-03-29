import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

type PaginationBaseProps = {
    current: number
    pageSize: number
    total: number
    pageRanges?: number
    onChange?: (page: number) => void
}

export function PaginationBase({
    current,
    pageSize,
    total,
    pageRanges = 5,
    onChange,
}: PaginationBaseProps) {
    const totalPage = Math.ceil(total / pageSize)

    const getPages = () => {
        const pages: (number | "ellipsis")[] = []

        const start = Math.max(1, current - Math.floor(pageRanges / 2))
        const end = Math.min(totalPage, start + pageRanges - 1)

        if (start > 1) {
            pages.push(1)
            if (start > 2) pages.push("ellipsis")
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        if (end < totalPage) {
            if (end < totalPage - 1) pages.push("ellipsis")
            pages.push(totalPage)
        }

        return pages
    }

    const pages = getPages()

    return (
        <Pagination >
            <PaginationContent className="gap-4 cursor-pointer flex-wrap">

                {current > 1 && (
                    <PaginationItem >
                        <PaginationPrevious
                            onClick={() => onChange?.(current - 1)}
                        />
                    </PaginationItem>
                )}

                {pages.map((page, index) =>
                    page === "ellipsis" ? (
                        <PaginationItem key={page + index}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                isActive={current === page}
                                onClick={() => onChange?.(page)}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                {current < totalPage && (
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onChange?.(current + 1)}
                        />
                    </PaginationItem>
                )}

            </PaginationContent>
        </Pagination>
    )
}