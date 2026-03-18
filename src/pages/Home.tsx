/* eslint-disable @typescript-eslint/no-explicit-any */
import HeroBanner from "@/components/features/Home/HeroBanner";
import MoodSection from "@/components/features/Home/MoodSection";
import MovieRow from "@/components/features/Movies/MovieRow";
import WatchHistoryRow from "@/components/features/Home/WatchHistoryRow";

import { useQueryMovies } from "@/lib/api/movies/movieQuery";
import useQueryResult from "@/hooks/useQueryResult";
import { MovieCategory } from "@/lib/api/movies/movieInterface";
import { Helmet } from "react-helmet-async";

const Home = () => {
  const { queryResult } = useQueryResult({ limit: 10, page: 1, sort_field: 'year' })
  const isLoad = queryResult?.q === ''
  const { data, isLoading } = useQueryMovies(queryResult, isLoad, MovieCategory.PHIM_MOI, 'danh-sach/' + MovieCategory.PHIM_MOI)
  const movieData = data as any;
  const { data: koreanMovies, isLoading: koreanMoviesLoading } = useQueryMovies(queryResult, isLoad, 'quoc-gia/han-quoc', 'quoc-gia/han-quoc')
  const { data: japanMovies, isLoading: japanMoviesLoading } = useQueryMovies(queryResult, isLoad, 'quoc-gia/nhat-ban', 'quoc-gia/nhat-ban')
  const { data: usMovies, isLoading: usMoviesLoading } = useQueryMovies(queryResult, isLoad, 'quoc-gia/au-my', 'quoc-gia/au-my')
  const { data: animeMovies, isLoading: animeMoviesLoading } = useQueryMovies(queryResult, isLoad, 'danh-sach/hoat-hinh', 'danh-sach/hoat-hinh')
  const koreanData = koreanMovies as any;
  const japanData = japanMovies as any;
  const usData = usMovies as any;
  const animeData = animeMovies as any;

  return (
    <>
      <Helmet>
        <title>Trang chủ - Pinuss Flix</title>
      </Helmet>
      <HeroBanner />
      <MoodSection />
      <WatchHistoryRow />
      <MovieRow title="Phim Mới Cập Nhật" movies={movieData?.data?.items} loading={isLoading} type={`danh-sach`} type_list={movieData?.data?.type_list} />
      <MovieRow title="Phim Hàn Quốc Mới" movies={koreanData?.data?.items} loading={koreanMoviesLoading} type_list={koreanData?.data?.type_list} />
      <MovieRow title="Phim Nhật Bản mới" movies={japanData?.data?.items} loading={japanMoviesLoading} type_list={japanData?.data?.type_list} />
      <MovieRow title="Phim Mỹ, Âu Mới" movies={usData?.data?.items} loading={usMoviesLoading} type_list={usData?.data?.type_list} />
      <MovieRow title="Phim Hoạt Hình" type={`danh-sach`} movies={animeData?.data?.items} loading={animeMoviesLoading} type_list={animeData?.data?.type_list} />
    </>
  );
};

export default Home;
