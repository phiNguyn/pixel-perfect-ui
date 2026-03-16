/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs, { Dayjs } from "dayjs";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { encryptedStorage } from "@/services/encryptedStorage";
import useDebounce from "./useDebounce";

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
  persistKey?: string; // Key để lưu filters vào localStorage, nếu có thì sẽ persist
  defaultFilters?: ItemQueryField[]; // Default filters khi mới vào hoặc khi clearAll
  queryMode?: "q" | "flat"; // "q" => gộp filters vào q=..., "flat" => country=...&category=...
  syncUrl?: boolean; // Sync filters/page lên URL + hydrate từ URL khi F5
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

  // Helper: Load toàn bộ persisted data (filters + search) - Encrypted & Merged
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

  // Helper: Save toàn bộ data (filters + search) - Encrypted & Merged
  const savePersistedData = (filters: ItemQueryField[], search: string) => {
    if (!persistKey) return;

    try {
      const data: PersistedQueryData = { filters, search };
      encryptedStorage.setItem(`query_${persistKey}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save persisted query data:", error);
    }
  };

  // Load persisted data
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
      const parsed = queryString.parse(window.location.search, {
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

  // Debounce search value với delay 500ms
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Track props ban đầu để giữ nguyên fields, sort_field, etc.
  const initialPropsRef = useRef(props);
  const lastGeneratedRef = useRef<string>(undefined);

  const buildQueryResult = () => {
    const {
      persistKey: _pk,
      defaultFilters: _df,
      queryMode: _qm,
      ...initialQuery
    } = (initialPropsRef.current ?? {}) as QueryResultProps;

    let queryString = "";

    // Nếu có itemQueries, dùng nó
    if (itemQueries.length > 0) {
      const final = itemQueries
        .filter((item) => item.value)
        .map((item) => item.query);
      queryString = final.join("&");
    } else if (initialPropsRef.current?.q) {
      // Nếu không có itemQueries, dùng q từ props ban đầu
      queryString =
        typeof initialPropsRef.current.q === "string"
          ? initialPropsRef.current.q
          : "";
    }

    // Merge: props ban đầu + page state + query từ filters
    const finalQuery: QueryResult = {
      ...defaultQuery,
      ...initialQuery,
      page,
      limit,
      s: debouncedSearchValue || undefined, // Thêm search value với debounce
    };

    if (queryMode === "flat") {
      // flat mode: đưa filters ra top-level query params
      itemQueries
        .filter((item) => item.value)
        .forEach((item) => {
          finalQuery[item.key] = item.value;
        });

      // không dùng q trong flat mode
      delete finalQuery.q;
    } else {
      // q mode: gộp filters vào q=...
      finalQuery.q = queryString;
    }

    return finalQuery;
  };

  const updateQueryResult = () => {
    const newQuery = buildQueryResult();
    const dependencyKey = JSON.stringify(newQuery);

    // Chỉ update khi có thay đổi
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

  // Sync queryResult lên URL (để refresh giữ trạng thái)
  useEffect(() => {
    if (!syncUrl) return;
    if (!queryResult) return;
    if (typeof window === "undefined") return;

    const next = queryString.stringify(queryResult, {
      skipNull: true,
      skipEmptyString: true,
    });

    const nextUrl = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash || ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [queryResult, syncUrl]);

  // Update khi itemQueries, page, limit, hoặc debouncedSearchValue thay đổi
  useEffect(() => {
    setpage(1);
    updateQueryResult();
  }, [itemQueries, debouncedSearchValue]);

  useEffect(() => {
    updateQueryResult();
  }, [page, limit]);

  // Auto-save cả filters và search vào localStorage (encrypted & merged)
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
        // Nếu đã tồn tại
        if (input.value) {
          // Update cả value và query
          pageItems[findIndexkey] = {
            ...pageItems[findIndexkey],
            value: input.value,
            query: input.query,
          };
        } else {
          // Xóa item nếu value là null/undefined/empty
          pageItems.splice(findIndexkey, 1);
        }
      } else {
        // Chỉ thêm mới nếu có value
        if (input.value) {
          pageItems.push(input);
        }
      }
      return pageItems;
    });
  };

  // setQuery: Legacy support - cho phép override trực tiếp queryResult
  // Lưu ý: Không nên dùng cùng với addQuery vì sẽ conflict
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

  // Clear tất cả filters (giữ nguyên search)
  const clearFilters = () => {
    setItemQueries([]);
    // Không clear search, chỉ clear filters
    if (persistKey) {
      savePersistedData([], searchValue);
    }
  };

  // Clear 1 filter cụ thể by key
  const clearFilter = (key: string) => {
    setItemQueries((prevItems) => {
      const filtered = prevItems.filter((item) => item.key !== key);
      return filtered;
    });
  };

  // Clear tất cả (filters + search) và reset về default
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

  const getDateRangeValue = (key): [Dayjs, Dayjs] | null => {
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
    searchValue, // Expose search value để gắn vào Input
    setSearch: setSearchValue, // Set search value (field s)
    setQuery: handleSetQuery, // Legacy support
    addQuery,
    clearFilters, // Clear tất cả filters (giữ search)
    clearFilter, // Clear 1 filter cụ thể
    clearAll, // Clear tất cả (filters + search)
    filters: itemQueries, // Expose filters để component có thể set default values
    getFilterValue,
    getDateRangeValue,
  };
};

export default useQueryResult;
