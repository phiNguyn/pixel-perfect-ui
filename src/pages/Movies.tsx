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
import { SkeletonCard } from "@/components/features/Movies/Skeletons/SkeletonCard"
import BreadCrumb from "@/components/Common/BreadCrumb"

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
    }>(queryResult, slug ? true : false, type, `${type}/${slug}`, false)

    const { items = [], params, titlePage, breadCrumb } = data?.data ?? {}
    const { pagination } = params ?? {}
    return (
        <div className="px-4 my-0 mx-auto max-w-[1400px]">
            <Helmet>
                <title>{titlePage ? `${titlePage} - Pinuss Flix` : 'Pinuss Flix'}</title>
                <meta name="description" content={`Danh sách ${titlePage ?? 'phim'} mới nhất, Vietsub chất lượng cao tại Pinuss Flix.`} />
                <link rel="canonical" href={`https://pinuss-flix.vercel.app/${type}/${slug}`} />
                <meta property="og:title" content={`${titlePage} - Pinuss Flix`} />
                <meta property="og:description" content={`Danh sách ${titlePage ?? 'phim'} mới nhất tại Pinuss Flix.`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://pinuss-flix.vercel.app/${type}/${slug}`} />
                <meta name="prerender-status-code" content="200" />
            </Helmet>

            <BreadCrumb breadCrumb={breadCrumb} />

            <div className="w-100 flex justify-end"><Filter clearAll={clearAll} addQuery={addQuery} getFilterValue={getFilterValue} /></div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center ">
                {isLoading || isFetching ? <SkeletonCard className="w-100 md:w-100 h-[320px]" count={24} /> : items.map(item => (
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