import queryString from "query-string";
import { QueryResult } from "@/hooks/useQueryResult";

import { BaseApi } from "@/lib/client";

export class MoviesApi extends BaseApi {
  constructor() {
    super("");
  }

  async findAll(queryParam: QueryResult, slug: string) {
    const stringified = queryString.stringify(queryParam, {
      skipNull: true,
      skipEmptyString: true,
    });

    return this.get(`${slug}?` + stringified);
  }

  async findOne(slug: string, peoples?: string) {
    return this.get(`phim/${slug}${peoples ? peoples : ""}`);
  }
  async searchMovie(queryParam: string) {
    return this.get(`/tim-kiem?keyword=${queryParam}&limit=10`);
  }
}

export const moviesApi = new MoviesApi();
