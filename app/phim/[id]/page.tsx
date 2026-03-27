import { Metadata } from "next";
import { fetchMovieDetail } from "@/lib/api/server";
import MovieDetailClient from "./movie-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO - This runs on server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const movieData = await fetchMovieDetail(id);
    const movie = movieData?.data?.item;
    const seoOnPage = movieData?.data?.seoOnPage;

    if (!movie) {
      return {
        title: "Phim không tồn tại - Pinuss Flix",
        description: "Không tìm thấy phim bạn yêu cầu",
      };
    }

    const posterUrl = `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`;
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
  
  // Fetch initial data on server for better performance
  const movieData = await fetchMovieDetail(id);

  return <MovieDetailClient movieSlug={id} initialData={movieData} />;
}
