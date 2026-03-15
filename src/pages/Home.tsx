/* eslint-disable @typescript-eslint/no-explicit-any */
import HeroBanner from "@/components/features/Home/HeroBanner";
import MoodSection from "@/components/features/Home/MoodSection";
import MovieRow from "@/components/features/Movies/MovieRow";

import { useQueryMovies } from "@/lib/api/movies/movieQuery";
import useQueryResult from "@/hooks/useQueryResult";
import { MovieCategory } from "@/lib/api/movies/movieInterface";

const Home = () => {
  const { queryResult } = useQueryResult({ limit: 10, page: 1, sort_field: 'year' })
  const { data, isLoading } = useQueryMovies(queryResult, true, MovieCategory.PHIM_MOI, 'danh-sach/' + MovieCategory.PHIM_MOI)
  const movieData = data as any;
  const { data: koreanMovies, isLoading: koreanMoviesLoading } = useQueryMovies(queryResult, true, 'quoc-gia/han-quoc', 'quoc-gia/han-quoc')
  const { data: japanMovies, isLoading: japanMoviesLoading } = useQueryMovies(queryResult, true, 'quoc-gia/nhat-ban', 'quoc-gia/nhat-ban')
  const { data: usMovies, isLoading: usMoviesLoading } = useQueryMovies(queryResult, true, 'quoc-gia/au-my', 'quoc-gia/au-my')
  const { data: animeMovies, isLoading: animeMoviesLoading } = useQueryMovies(queryResult, true, 'danh-sach/hoat-hinh', 'danh-sach/hoat-hinh')

  return (
    <>
      <HeroBanner />
      <MoodSection />
      <MovieRow title="Phim Mới Cập Nhật" movies={movieData?.data?.items} loading={isLoading} type_list={movieData?.data?.type_list} />
      <MovieRow title="Phim Hàn Quốc Mới" movies={koreanMovies?.data?.items as any} loading={koreanMoviesLoading} type_list={koreanMovies?.data?.type_list} />
      <MovieRow title="Phim Nhật Bản mới" movies={japanMovies?.data?.items} loading={japanMoviesLoading} type_list={japanMovies?.data?.type_list} />
      <MovieRow title="Phim Mỹ, Âu Mới" movies={usMovies?.data?.items} loading={usMoviesLoading} type_list={usMovies?.data?.type_list} />
      <MovieRow title="Phim Hoạt Hình" movies={animeMovies?.data?.items} loading={animeMoviesLoading} type_list={animeMovies?.data?.type_list} />
      {/* <MovieRow title="Top 10 Phim Kế Bên Nay" movies={topMovies} showRank /> */}
    </>
  );
};

export default Home;
