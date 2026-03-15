/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs, { Dayjs } from "dayjs";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { encryptedStorage } from "@/services/encryptedStorage";
import useDebounce from "./useDebounce";

export interface QueryResult {
  q?: Record<string, any> | string;
  s?: string;
  sort?: string[] | string;
  fields?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

interface QueryResultProps extends Partial<QueryResult> {
  persistKey?: string; // Key để lưu filters vào localStorage, nếu có thì sẽ persist
  defaultFilters?: ItemQueryField[]; // Default filters khi mới vào hoặc khi clearAll
}

const generateQueryParams = (query: QueryResult): QueryResult => {
  const q =
    typeof query.q === "object" && query.q !== null
      ? queryString.stringify(query.q, {
          skipNull: true,
          skipEmptyString: true,
        })
      : query.q;

  const sort = Array.isArray(query.sort) ? query.sort.join(",") : query.sort;

  return {
    ...query,
    q,
    sort,
  };
};

const defaultQuery: QueryResult = {
  q: {},
  s: null,
  sort: [],
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
  const [page, setpage] = useState<number>(props?.page || defaultQuery.page);
  const [limit, setlimit] = useState<number>(
    props?.limit || defaultQuery.limit,
  );
  const [searchValue, setSearchValue] = useState<string>(persistedData.search);
  const [itemQueries, setItemQueries] = useState<ItemQueryField[]>(
    persistedData.filters,
  );

  // Debounce search value với delay 500ms
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Track props ban đầu để giữ nguyên fields, sort, etc.
  const initialPropsRef = useRef(props);
  const lastGeneratedRef = useRef<string>(undefined);

  const buildQueryResult = () => {
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
      ...initialPropsRef.current,
      page,
      limit,
      q: queryString,
      s: debouncedSearchValue || undefined, // Thêm search value với debounce
    };

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
