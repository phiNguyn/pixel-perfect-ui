"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs, { Dayjs } from "dayjs";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { encryptedStorage } from "@/services/encryptedStorage";
import useDebounce from "./useDebounce";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export interface QueryResult {
  q?: Record<string, any> | string;
  s?: string;
  sort_field?: string[] | string;
  fields?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

interface QueryResultProps extends Partial<QueryResult> {
  persistKey?: string;
  defaultFilters?: ItemQueryField[];
  queryMode?: "q" | "flat";
  syncUrl?: boolean;
}

const generateQueryParams = (query: QueryResult): QueryResult => {
  const q =
    typeof query.q === "object" && query.q !== null
      ? queryString.stringify(query.q, {
          skipNull: true,
          skipEmptyString: true,
        })
      : query.q;

  const sort_field = Array.isArray(query.sort_field)
    ? query.sort_field.join(",")
    : query.sort_field;

  return {
    ...query,
    q,
    sort_field,
  };
};

const defaultQuery: QueryResult = {
  q: {},
  s: null,
  sort_field: [],
  fields: "",
  page: 1,
  limit: 50,
};

export interface ItemQueryField {
  key: string;
  value: string;
  query: string;
  isAdvanced?: boolean;
}

interface PersistedQueryData {
  filters: ItemQueryField[];
  search: string;
}

const useQueryResult = (props?: QueryResultProps) => {
  const persistKey = props?.persistKey;
  const defaultFilters = props?.defaultFilters || [];
  const queryMode = props?.queryMode ?? "q";
  const syncUrl = props?.syncUrl ?? false;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const loadPersistedData = (): PersistedQueryData => {
    if (!persistKey) return { filters: defaultFilters, search: props?.s || "" };

    try {
      const encrypted = encryptedStorage.getItem(`query_${persistKey}`);
      if (!encrypted)
        return { filters: defaultFilters, search: props?.s || "" };

      const data = JSON.parse(encrypted) as PersistedQueryData;
      return {
        filters: data.filters || defaultFilters,
        search: data.search || props?.s || "",
      };
    } catch (error) {
      console.error("Failed to load persisted query data:", error);
      return { filters: defaultFilters, search: props?.s || "" };
    }
  };

  const savePersistedData = (filters: ItemQueryField[], search: string) => {
    if (!persistKey) return;

    try {
      const data: PersistedQueryData = { filters, search };
      encryptedStorage.setItem(`query_${persistKey}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save persisted query data:", error);
    }
  };

  const persistedData = loadPersistedData();

  const [queryResult, setQueryResult] = useState<QueryResult>();
  const urlInitRef = useRef<{
    page?: number;
    limit?: number;
    search?: string;
    filters?: ItemQueryField[];
  } | null>(null);

  if (urlInitRef.current === null) {
    if (syncUrl && typeof window !== "undefined") {
      const parsed = queryString.parse(searchParams.toString(), {
        arrayFormat: "comma",
      }) as Record<string, unknown>;

      const reserved = new Set(["page", "limit", "q", "s"]);
      const urlFilters: ItemQueryField[] = [];

      Object.entries(parsed).forEach(([key, value]) => {
        if (reserved.has(key)) return;
        if (value === undefined || value === null) return;
        const str = Array.isArray(value) ? value.join(",") : String(value);
        if (!str) return;
        urlFilters.push({ key, value: str, query: `${key}=${str}` });
      });

      urlInitRef.current = {
        page: parsed.page ? Number(parsed.page) : undefined,
        limit: parsed.limit ? Number(parsed.limit) : undefined,
        search: typeof parsed.s === "string" ? parsed.s : undefined,
        filters: urlFilters.length ? urlFilters : undefined,
      };
    } else {
      urlInitRef.current = {};
    }
  }

  const [page, setpage] = useState<number>(() => {
    const urlPage = urlInitRef.current?.page;
    return urlPage && !Number.isNaN(urlPage)
      ? urlPage
      : props?.page || defaultQuery.page;
  });

  const [limit, setlimit] = useState<number>(() => {
    const urlLimit = urlInitRef.current?.limit;
    return urlLimit && !Number.isNaN(urlLimit)
      ? urlLimit
      : props?.limit || defaultQuery.limit;
  });

  const [searchValue, setSearchValue] = useState<string>(() => {
    return urlInitRef.current?.search ?? persistedData.search;
  });

  const [itemQueries, setItemQueries] = useState<ItemQueryField[]>(() => {
    return urlInitRef.current?.filters ?? persistedData.filters;
  });

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const initialPropsRef = useRef(props);
  const lastGeneratedRef = useRef<string>(undefined);

  const buildQueryResult = () => {
    const {
      persistKey: _pk,
      defaultFilters: _df,
      queryMode: _qm,
      ...initialQuery
    } = (initialPropsRef.current ?? {}) as QueryResultProps;

    let queryStr = "";

    if (itemQueries.length > 0) {
      const final = itemQueries
        .filter((item) => item.value)
        .map((item) => item.query);
      queryStr = final.join("&");
    } else if (initialPropsRef.current?.q) {
      queryStr =
        typeof initialPropsRef.current.q === "string"
          ? initialPropsRef.current.q
          : "";
    }

    const finalQuery: QueryResult = {
      ...defaultQuery,
      ...initialQuery,
      page,
      limit,
      s: debouncedSearchValue || undefined,
    };

    if (queryMode === "flat") {
      itemQueries
        .filter((item) => item.value)
        .forEach((item) => {
          finalQuery[item.key] = item.value;
        });

      delete finalQuery.q;
    } else {
      finalQuery.q = queryStr;
    }

    return finalQuery;
  };

  const updateQueryResult = () => {
    const newQuery = buildQueryResult();
    const dependencyKey = JSON.stringify(newQuery);

    if (lastGeneratedRef.current === dependencyKey) {
      return;
    }

    lastGeneratedRef.current = dependencyKey;

    const generatedQuery = generateQueryParams(newQuery);

    setQueryResult((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(generatedQuery)) {
        return prev;
      }
      return generatedQuery;
    });
  };

  useEffect(() => {
    if (!syncUrl) return;
    if (!queryResult) return;
    if (typeof window === "undefined") return;

    const next = queryString.stringify(queryResult, {
      skipNull: true,
      skipEmptyString: true,
    });

    const nextUrl = `${pathname}${next ? `?${next}` : ""}`;
    router.replace(nextUrl, { scroll: false });
  }, [queryResult, syncUrl, pathname, router]);

  useEffect(() => {
    setpage(1);
    updateQueryResult();
  }, [itemQueries, debouncedSearchValue]);

  useEffect(() => {
    updateQueryResult();
  }, [page, limit]);

  useEffect(() => {
    if (persistKey) {
      savePersistedData(itemQueries, debouncedSearchValue);
    }
  }, [itemQueries, debouncedSearchValue, persistKey]);

  const addQuery = (input: ItemQueryField) => {
    setItemQueries((prevItems) => {
      const pageItems = [...prevItems];
      const findIndexkey = pageItems.findIndex(
        (item) => item.key === input.key,
      );

      if (findIndexkey >= 0) {
        if (input.value) {
          pageItems[findIndexkey] = {
            ...pageItems[findIndexkey],
            value: input.value,
            query: input.query,
          };
        } else {
          pageItems.splice(findIndexkey, 1);
        }
      } else {
        if (input.value) {
          pageItems.push(input);
        }
      }
      return pageItems;
    });
  };

  const handleSetQuery = (queryProps: QueryResultProps) => {
    const newQuery = buildQueryResult();
    const mergedQuery = {
      ...newQuery,
      ...queryProps,
    };

    const dependencyKey = JSON.stringify(mergedQuery);

    if (lastGeneratedRef.current === dependencyKey) {
      return;
    }

    lastGeneratedRef.current = dependencyKey;
    const generatedQuery = generateQueryParams(mergedQuery);

    setQueryResult((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(generatedQuery)) {
        return prev;
      }
      return generatedQuery;
    });
  };

  const clearFilters = () => {
    setItemQueries([]);
    if (persistKey) {
      savePersistedData([], searchValue);
    }
  };

  const clearFilter = (key: string) => {
    setItemQueries((prevItems) => {
      const filtered = prevItems.filter((item) => item.key !== key);
      return filtered;
    });
  };

  const clearAll = () => {
    setItemQueries(defaultFilters);
    setSearchValue("");
    if (persistKey) {
      savePersistedData(defaultFilters, "");
    }
  };

  const getFilterValue = (
    key: string,
    type: "string" | "array" = "string",
  ): any => {
    const filter = itemQueries.find((f) => f.key === key);
    if (type === "array") {
      if (filter?.value) {
        return filter?.value?.split(",");
      }
      return [];
    } else {
      return filter?.value || "";
    }
  };

  const getDateRangeValue = (key: string): [Dayjs, Dayjs] | null => {
    const dateValue = getFilterValue(key);
    if (!dateValue) return null;

    try {
      const [start, end] = dateValue.split(",");
      if (start && end) {
        return [dayjs(start), dayjs(end)];
      }
    } catch (error) {
      console.error("Failed to parse date range:", error);
    }
    return null;
  };

  return {
    queryResult,
    setPage: setpage,
    setlimit,
    searchValue,
    setSearch: setSearchValue,
    setQuery: handleSetQuery,
    addQuery,
    clearFilters,
    clearFilter,
    clearAll,
    filters: itemQueries,
    getFilterValue,
    getDateRangeValue,
  };
};

export default useQueryResult;
