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

    return this.get(`danh-sach/${slug}?` + stringified);
  }

  async findOne(slug: string) {
    return this.get(slug);
  }
}

export const moviesApi = new MoviesApi();
