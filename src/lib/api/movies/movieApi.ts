import queryString from "query-string";
import { QueryResult } from "@/hooks/useQueryResult";

import { BaseApi } from "@/lib/client";
export class OphimApi extends BaseApi {
  constructor() {
    super("");
  }
  async findOne<T>(slug: string, peoples?: string): Promise<T> {
    return this.get<T>(`phim/${slug}${peoples ? peoples : ""}`);
  }
  async searchMovie<T>(queryParam: string): Promise<T> {
    return this.get<T>(`/tim-kiem?keyword=${queryParam}&limit=10`);
  }
}
export class MoviesApi extends BaseApi {
  constructor() {
    super("https://phimapi.com/v1/api/");
  }

  async findAll<T>(queryParam: QueryResult, slug: string): Promise<T> {
    const stringified = queryString.stringify(queryParam, {
      skipNull: true,
      skipEmptyString: true,
    });

    return this.get<T>(`${slug}?` + stringified);
  }

  async findAllWithoutPrefix<T>(
    slug: string,
    queryParam?: QueryResult,
  ): Promise<T> {
    const stringified = queryString.stringify(queryParam, {
      skipNull: true,
      skipEmptyString: true,
    });
    const query = stringified ? `?${stringified}` : "";
    return this.get<T>(`https://phimapi.com/${slug}${query}`, false);
  }

  async findOne<T>(slug: string, peoples?: string): Promise<T> {
    return this.get<T>(`phim/${slug}${peoples ? peoples : ""}`);
  }
  async searchMovie<T>(queryParam: string): Promise<T> {
    return this.get<T>(`/tim-kiem?keyword=${queryParam}&limit=10`);
  }
}

export const moviesApi = new MoviesApi();
export const ophimApi = new OphimApi();
