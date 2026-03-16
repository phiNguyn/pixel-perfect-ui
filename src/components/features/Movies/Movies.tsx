import MovieCard from "@/components/features/Movies/MovieCard"
import { PaginationBase } from "@/components/layouts/Pagination"
import { Loader } from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import useQueryResult from "@/hooks/useQueryResult"
import { useQueryMovies } from "@/lib/api/movies/movieQuery"
import { Filter } from "lucide-react"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { redirect, useNavigate, useParams } from "react-router-dom"

const Movies = () => {
    const { slug, type } = useParams();
    const navigate = useNavigate()
     useEffect(() => {
    if (slug === "phim-18") {
      navigate("/");
    }
  }, [slug, navigate]);
    const { queryResult, setPage } = useQueryResult({ limit: 24, page: 1, sort_field: 'year' })
    const { data, isLoading, isFetching } = useQueryMovies(queryResult, slug ? true : false, type, `${type}/${slug}`, true)
    const { items, params, titlePage } = data?.data || []
    const { pagination } = params || []
    return (
        <div className="px-4 my-0 mx-auto max-w-[1400px]">
            <Helmet>
                <title>{titlePage}</title>
            </Helmet>
            <Button size="sm" className="my-2"><Filter />Bộ lọc (nào rãnh làm)</Button>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center ">
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