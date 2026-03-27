/* eslint-disable @typescript-eslint/no-explicit-any */
import queryString from "query-string";
import { QueryResult } from "@/hooks/useQueryResult";

import { BaseApi } from "@/lib/client";

export class CategorysApi extends BaseApi {
  constructor() {
    super("the-loai");
  }

  async findAll(queryParam: QueryResult, slug: string) {
    const stringified = queryString.stringify(queryParam, {
      skipNull: true,
      skipEmptyString: true,
    });

    return this.get<any>(`?` + stringified);
  }
}

export const categorysApi = new CategorysApi();
