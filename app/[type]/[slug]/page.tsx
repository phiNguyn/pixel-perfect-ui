import { Metadata } from "next";
import { fetchMoviesByCategory } from "@/lib/api/server";
import MoviesListClient from "./movies-list-client";

interface Props {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Type mapping for SEO
const typeMapping: Record<string, string> = {
  "the-loai": "Thể loại",
  "quoc-gia": "Quốc gia",
  "danh-sach": "Danh sách",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  
  try {
    const data = await fetchMoviesByCategory(type, slug, 1);
    const titlePage = data?.titlePage || slug;
    const typeName = typeMapping[type] || type;

    return {
      title: `${titlePage} - Xem phim ${typeName} | Pinuss Flix`,
      description: `Danh sách phim ${titlePage} mới nhất, Vietsub chất lượng cao tại Pinuss Flix. Cập nhật liên tục các bộ phim hot nhất.`,
      openGraph: {
        title: `${titlePage} - Xem phim ${typeName} | Pinuss Flix`,
        description: `Danh sách phim ${titlePage} mới nhất, Vietsub chất lượng cao tại Pinuss Flix.`,
        type: "website",
        url: `https://pinuss-flix.vercel.app/${type}/${slug}`,
        siteName: "Pinuss Flix",
      },
      twitter: {
        card: "summary_large_image",
        title: `${titlePage} - Pinuss Flix`,
        description: `Danh sách phim ${titlePage} mới nhất tại Pinuss Flix.`,
      },
      alternates: {
        canonical: `https://pinuss-flix.vercel.app/${type}/${slug}`,
      },
    };
  } catch {
    return {
      title: "Danh sách phim | Pinuss Flix",
      description: "Xem phim online miễn phí, Vietsub chất lượng cao tại Pinuss Flix.",
    };
  }
}

export default async function MoviesPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  // Fetch initial data for SSR
  const initialData = await fetchMoviesByCategory(type, slug, page);

  return (
    <MoviesListClient
      type={type}
      slug={slug}
      initialData={initialData}
      initialPage={page}
    />
  );
}
