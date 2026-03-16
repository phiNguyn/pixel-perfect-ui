/* eslint-disable @typescript-eslint/no-explicit-any */
import queryString from "query-string";
import { QueryResult } from "@/hooks/useQueryResult";

import { BaseApi } from "@/lib/client";

export class ThiaPhimApi extends BaseApi {
  constructor() {
    super("https://thiaphim.net/baseapi/api/v1/movies/hot");
  }

  async findAll() {
    return this.get("");
  }
}

export const thiaPhimApi = new ThiaPhimApi();
