import { useQuery } from "@tanstack/react-query";
import {
  nguoncApi,
  convertNguoncToMovie,
  convertNguoncDetailToIMovieDetail,
  NguoncSearchResponse,
  NguoncMovieDetailResponse,
  NguoncMovieDetail,
} from "./nguonc.api";
import { Movie, IMovieDetail } from "@/lib/api/movies/movieInterface";

export const useQueryNguoncSearchMovie = (q: string) => {
  return useQuery<{ items: Movie[] }>({
    queryKey: ["nguonc-search", q],
    enabled: !!q,
    queryFn: async () => {
      const data = (await nguoncApi.searchMovie(
        q as string,
      )) as NguoncSearchResponse;
      return {
        items: data.items.map(convertNguoncToMovie),
      };
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQueryNguoncGetMovie = (link: string, enabled: boolean) => {
  return useQuery<IMovieDetail>({
    queryKey: ["nguonc-get-movie", link],
    enabled: !!link && enabled,
    queryFn: async () => {
      const data = (await nguoncApi.getMovie(
        link as string,
      )) as NguoncMovieDetailResponse;
      return convertNguoncDetailToIMovieDetail(data.movie);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
