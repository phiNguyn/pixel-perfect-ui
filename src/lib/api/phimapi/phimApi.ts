import { BaseApi } from "@/lib/client";

export class PhimApi extends BaseApi {
  constructor() {
    super("https://phimapi.com/");
  }

  async findOne<T>(slug: string, peoples?: string): Promise<T> {
    return this.get<T>(`phim/${slug}${peoples ? peoples : ""}`);
  }
}

export const phimApiDetail = new PhimApi();
