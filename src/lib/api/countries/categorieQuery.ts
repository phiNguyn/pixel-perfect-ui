import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@/hooks/useQueryResult";
import { categorysApi } from "./countryApi";

export const useQueryCategories = (
  query?: QueryResult,
  enabled = true,
  key = "categories",
  slug?: string,
) => {
  return useQuery({
    queryKey: [key, JSON.stringify(query)],
    queryFn: () => categorysApi.findAll(query, slug),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
