import { Metadata } from "next";
import { fetchMovieDetail } from "@/lib/api/server";
import MovieDetailClient from "./movie-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

// Use dynamic rendering for this route
export const dynamic = "force-dynamic";

// Normalize both API response structures
function normalizeMovieData(data: any) {
  // ophim structure
  if (data?.data?.item) {
    return {
      movie: data.data.item,
      seoOnPage: data.data.seoOnPage,
      source: "ophim" as const,
    };
  }
  // phimapi fallback structure
  if (data?.movie) {
    return {
      movie: data.movie,
      seoOnPage: null,
      source: "phimapi" as const,
    };
  }
  return { movie: null, seoOnPage: null, source: null };
}

function getPosterUrl(movie: any, source: string | null) {
  if (!movie) return "";
  if (source === "phimapi") {
    return movie.poster_url || movie.thumb_url;
  }
  return movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`;
}

// Generate dynamic metadata for SEO - This runs on server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const rawData = await fetchMovieDetail(id);
    const { movie, seoOnPage, source } = normalizeMovieData(rawData);

    if (!movie) {
      return {
        title: "Phim không tồn tại - Pinuss Flix",
        description: "Không tìm thấy phim bạn yêu cầu",
      };
    }

    const posterUrl = getPosterUrl(movie, source);
    const pageUrl = `https://pinuss-flix.vercel.app/phim/${movie.slug}`;

    return {
      title: seoOnPage?.titleHead || `${movie.name} - Pinuss Flix`,
      description: seoOnPage?.descriptionHead || movie.content?.slice(0, 160),
      robots: "index, follow",
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        type: "video.movie",
        title: seoOnPage?.titleHead || movie.name,
        description: seoOnPage?.descriptionHead || movie.content?.slice(0, 160),
        images: [
          {
            url: posterUrl,
            width: 800,
            height: 1200,
            alt: movie.name,
          },
        ],
        url: pageUrl,
        siteName: "Pinuss Flix",
      },
      twitter: {
        card: "summary_large_image",
        title: movie.name,
        description: seoOnPage?.descriptionHead || movie.content?.slice(0, 160),
        images: [posterUrl],
      },
      other: seoOnPage?.seoSchema
        ? {
          "script:ld+json": JSON.stringify(seoOnPage.seoSchema),
        }
        : undefined,
    };
  } catch {
    return {
      title: "Phim - Pinuss Flix",
      description: "Xem phim online miễn phí chất lượng cao",
    };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const rawData = await fetchMovieDetail(id);
  const { movie, seoOnPage, source } = normalizeMovieData(rawData);

  return <MovieDetailClient movieDetail={movie} />;
}
