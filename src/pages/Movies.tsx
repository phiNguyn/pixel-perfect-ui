import MovieCard from "@/components/features/Movies/MovieCard"
import { PaginationBase } from "@/components/layouts/Pagination"
import { Loader } from "@/components/Spinner"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Filter } from "@/components/Common/Filter"
import useQueryResult from "@/hooks/useQueryResult"
import { useQueryMovies } from "@/lib/api/movies/movieQuery"
import { Movie } from "@/lib/api/movies/movieInterface"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useNavigate, useParams } from "react-router-dom"

type BreadCrumbItem = {
    name: string
    slug?: string
    isCurrent: boolean
    position: number
}

type MoviesPagination = {
    currentPage: number
    totalItemsPerPage: number
    totalItems: number
}

const Movies = () => {
    const { slug, type } = useParams();
    const navigate = useNavigate()
    useEffect(() => {
        if (slug === "phim-18") {
            navigate("/");
        }
    }, [slug, navigate]);
    const { queryResult, setPage, addQuery, getFilterValue, clearAll } = useQueryResult({
        limit: 24,
        sort_field: 'year',
        queryMode: "flat",
        syncUrl: true,
    })
    const { data, isLoading, isFetching } = useQueryMovies<{
        data: {
            items: Movie[]
            params?: { pagination?: MoviesPagination }
            titlePage?: string
            breadCrumb?: BreadCrumbItem[]
        }
    }>(queryResult, slug ? true : false, type, `${type}/${slug}`, true)

    const { items = [], params, titlePage, breadCrumb } = data?.data ?? {}
    const { pagination } = params ?? {}
    return (
        <div className="px-4 my-0 mx-auto max-w-[1400px]">
            <Helmet>
                <title>{titlePage}</title>
            </Helmet>

            {!!breadCrumb?.length && (
                <Breadcrumb className="mt-3">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={'/'}>Trang chủ</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadCrumb
                            .slice()
                            .sort((a, b) => a.position - b.position)
                            .map((item, idx, arr) => (
                                <div key={`${item.position}-${item.name}`} className="contents">
                                    <BreadcrumbItem>
                                        {item.isCurrent || !item.slug ? (
                                            <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.slug}>{item.name}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {idx < arr.length - 1 && <BreadcrumbSeparator />}
                                </div>
                            ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            <div className="w-100 flex justify-end"><Filter clearAll={clearAll} addQuery={addQuery} getFilterValue={getFilterValue} /></div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center ">
                {isLoading || isFetching ? <Loader /> : items.map(item => (
                    <MovieCard movie={item} key={item._id} className="w-100 md:w-100" />
                ))}
            </div>
            <div className="mt-4">
                <PaginationBase
                    current={pagination?.currentPage ?? 1}
                    pageSize={pagination?.totalItemsPerPage ?? 24}
                    total={pagination?.totalItems ?? 0}
                    pageRanges={4}
                    onChange={(page) => {
                        setPage(page)
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })
                    }
                    }
                />
            </div>
        </div>
    )
}

export default Movies