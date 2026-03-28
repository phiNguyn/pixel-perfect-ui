import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://ophim1.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    
    // Build query string from search params
    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    
    // Add filter params
    const filterKeys = ["sort_field", "category", "country", "year", "type"];
    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        queryParams.set(key, value);
      }
    });

    const url = `${API_BASE}/v1/api/${type}/${slug}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch movies" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data?.data || {});
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
