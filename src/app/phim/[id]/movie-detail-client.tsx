/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Play, Heart, Share2, BookmarkPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useMemo, useState, useRef } from "react";
import { useQueryMovie, useQueryPhimApi } from "@/lib/api/movies/movieQuery";
import {
  Episode,
  convertPhimApiToIMovieDetail,
} from "@/lib/api/movies/movieInterface";
import Cast from "@/components/features/Movies/Cast";
import { useHistoryStore } from "@/stores/useHistoryStore";
import MovieImage from "@/components/features/Movies/MovieImage";
import { Modal } from "@/components/Common/Modal";
import MovieDetailSkeleton from "@/components/features/Movies/Skeletons/MovieDetailSkeleton";
import MovieNotFound from "@/components/features/Movies/MovieNotFound";
import EpisodeList from "@/components/features/Movies/EpisodeList";
import { CommentComponent } from "@/components/features/Movies/Comment";
import MovieRecommendations from "@/components/features/Movies/MovieRecommendations";
import TrendingMovies from "@/components/features/Movies/TrendingMovies";
import { analytics } from "@/lib/analytics";
import { trackMovieView } from "@/lib/hooks/useTrackMovieView";
import { useWatchSessionTracker } from "@/lib/hooks/useWatchSessionTracker";
import { useQueryMovieViewCount } from "@/lib/api/viewLog/viewLogQuery";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load MoviePlayer - heavy với hls.js, chỉ cần khi user chọn episode
const MoviePlayer = dynamic(
  () => import("@/components/Common/Player").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

const MOVIE_DETAIL_TABS = [
  { value: "tapphim", label: "Tập phim" },
  { value: "chitiet", label: "Chi tiết" },
  { value: "cast", label: "Diễn viên" },
  { value: "suggest", label: "Đề xuất" },
] as const;

export default function MovieDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams?.get("source") ?? "phimapi";
  const isPhimApi = source === "phimapi";
  const previousEpRef = useRef<string | null>(null);

  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useQueryMovie(id as string, undefined, source);
  const {
    data: rawDataPhimApi,
    isError: isErrorPhimApi,
    isLoading: isLoadingPhimApi,
    refetch: refetchPhimApi,
  } = useQueryPhimApi(id as string, isPhimApi);
  const {
    data: castData,
    isLoading: isLoadingCast,
    isError: isErrorCast,
  } = useQueryMovie(id as string, "/peoples", source);

  // 👉 normalize data
  const movieData = rawData as any;
  const phimApiData = rawDataPhimApi as any;

  const movie = useMemo(() => {
    if (isPhimApi) {
      return phimApiData
        ? convertPhimApiToIMovieDetail(phimApiData)
        : undefined;
    }
    return movieData?.data?.item;
  }, [isPhimApi, phimApiData, movieData]);

  const movieSlug = movie?.slug ?? id;
  const { data: movieViewCount = 0 } = useQueryMovieViewCount(
    movieSlug,
    !!movieSlug,
  );

  // 👉 loading + error theo source
  const loading = isPhimApi ? isLoadingPhimApi : isLoading;
  const loadingCast = isPhimApi ? isLoadingPhimApi : isLoadingCast;
  const error = isPhimApi ? isErrorPhimApi : isError;

  // 👉 breadcrumb
  // const breadCrumb = isPhimApi
  //   ? movie?.category.map((item) => ({
  //       name: item.name,
  //       slug: "/the-loai/" + item.slug,
  //     }))
  //   : (movieData?.data?.breadCrumb as any[]);
  const getPosterUrl = (type: "poster" | "thumb" = "poster") => {
    if (!movie) return "";
    if (isPhimApi) {
      return type === "poster" ? movie.thumb_url : movie.poster_url;
    }
    return type === "poster"
      ? movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`
      : movie.thumb_url?.startsWith("http")
        ? movie.thumb_url
        : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
  };

  const [selectedEp, setSelectedEp] = useState<Episode>();
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [commentCount, setCommentCount] = useState(0);

  const {
    addWatchHistory,
    updateWatchProgress,
    watchHistory,
    flushPendingUpdates,
  } = useHistoryStore();

  // Get saved time for current episode from watch history
  const savedStartTime = (() => {
    if (!movie || !selectedEp) return 0;
    const historyItem = watchHistory.find((h) => h.slug === movie.slug);
    if (
      historyItem &&
      historyItem.currentEpSlug === selectedEp.slug &&
      historyItem.currentTime > 0
    ) {
      return historyItem.currentTime;
    }
    return 0;
  })();

  useWatchSessionTracker({
    enabled: !!movie && !!selectedEp,
    movieId: movie?.slug ?? id,
    movieTitle: movie?.name ?? "",
    moviePoster: movie ? getPosterUrl("thumb") : undefined,
    originName: movie?.origin_name,
    year: movie?.year,
    source: isPhimApi ? "phimapi" : "ophim",
    episodeSlug: selectedEp?.slug ?? "",
    episodeName: selectedEp?.name,
  });

  // Track movie view on mount (analytics + database)
  useEffect(() => {
    if (movie) {
      // Analytics
      analytics.movieView({
        movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
        movie_title: movie.name,
        movie_slug: movie.slug,
        source: isPhimApi ? "phimapi" : "ophim",
      });

      // Track to database for trending
      trackMovieView({
        movieId: movie.slug,
        source: isPhimApi ? "phimapi" : "ophim",
        episodeSlug: selectedEp?.slug,
        episodeName: selectedEp?.name,
      });
    }
  }, [movie?.slug, isPhimApi, selectedEp?.slug, selectedEp?.name]);

  useEffect(() => {
    if (movie?.episodes?.length) {
      setSelectedServer(movie.episodes[0]);
    }
  }, [movie?.episodes?.length]);

  const handleSelectEp = (ep: Episode) => {
    // Flush pending updates before changing episode
    flushPendingUpdates();

    // Track episode change
    if (movie && selectedEp?.slug) {
      analytics.episodeChange({
        movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
        movie_title: movie.name,
        movie_slug: movie.slug,
        source: isPhimApi ? "phimapi" : "ophim",
        from_episode: selectedEp.slug,
        to_episode: ep.slug,
      });
    }

    // Track view to database
    if (movie) {
      trackMovieView({
        movieId: movie.slug,
        source: isPhimApi ? "phimapi" : "ophim",
        episodeSlug: ep.slug,
        episodeName: ep.name,
      });
    }

    previousEpRef.current = selectedEp?.slug || null;

    setSelectedEp(ep);
    const params = new URLSearchParams(searchParams.toString());
    params.set("ep", ep.slug ?? "");
    router.replace(`/phim/${id}?${params.toString()}`, { scroll: false });
    // Save to watch history
    if (movie) {
      addWatchHistory({
        slug: movie.slug,
        name: movie.name,
        thumb_url: isPhimApi ? movie.poster_url : movie.thumb_url,
        origin_name: movie.origin_name,
        episode_current: movie.episode_current,
        year: movie.year,
        quality: movie.quality,
        currentEpSlug: ep.slug,
        currentEpName: ep.name,
        duration: 0,
        source: isPhimApi ? "phimapi" : "ophim",
      });
    }
  };

  // Redirect back if movie is 18+
  useEffect(() => {
    if (movie?.category.some((item) => item.slug === "phim-18")) {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace("/"); // hoặc "/phim"
      }
    }
  }, [movie, router]);

  // Listen for time updates from the player
  useEffect(() => {
    const handleTimeUpdate = (e: CustomEvent) => {
      if (movie) {
        updateWatchProgress(
          movie.slug,
          e.detail.currentTime,
          e.detail.duration,
        );
      }
    };
    window.addEventListener(
      "player-time-update",
      handleTimeUpdate as EventListener,
    );
    return () =>
      window.removeEventListener(
        "player-time-update",
        handleTimeUpdate as EventListener,
      );
  }, [movie, updateWatchProgress]);

  // Flush pending updates when user changes episode or leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingUpdates();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Flush on component unmount (e.g., route change)
      flushPendingUpdates();
    };
  }, [flushPendingUpdates]);

  useEffect(() => {
    if (!movie || !selectedServer) return;
    const epSlug = searchParams?.get("ep") ?? "";
    if (!epSlug) return;
    const ep = selectedServer.server_data.find(
      (e: Episode) => e.slug === epSlug,
    );
    if (ep) setSelectedEp(ep);
  }, [movie, selectedServer, searchParams?.get("ep")]);

  if (loading) return <MovieDetailSkeleton />;
  if (error)
    return (
      <MovieNotFound
        onRetry={isPhimApi ? refetchPhimApi : refetch}
        type="error"
        slug={id}
      />
    );
  if (!movie)
    return (
      <MovieNotFound
        onRetry={isPhimApi ? refetchPhimApi : refetch}
        type="not-found"
        slug={id}
      />
    );
  return (
    <>
      <div className="mb-4">
        {/* Cinematic backdrop */}
        <div className="relative w-full h-[calc(56.25vw+64px)] md:h-[calc(100vh-128px)] overflow-hidden">
          <img
            width={1920}
            height={1080}
            loading="lazy"
            src={getPosterUrl("poster")}
            alt={movie.name + " poster"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.85) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 -mt-52 md:-mt-56 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {/* Movie header */}
              <div className="flex mt-20 md:mt-0 flex-col md:flex-row gap-5 md:gap-7 mb-8">
                <div className="flex items-center md:items-end justify-center md:justify-start">
                  <div className="w-[130px] md:w-[170px] aspect-[2/3] rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-2xl shadow-primary/20 flex-shrink-0">
                    <MovieImage
                      movie={movie}
                      source={isPhimApi ? "phimapi" : "ophim"}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-primary/80">
                    {movie.name}
                  </h1>
                  {movie?.origin_name && (
                    <div className="text-base md:text-xl text-muted-foreground italic font-medium">
                      {movie.origin_name}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 text-primary font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {movie.tmdb?.vote_average ?? "—"}
                    </span>
                    {movie.year && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        <span>{movie.year}</span>
                      </>
                    )}
                    {movie.episode_current && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        <span>
                          {movie.episode_current}
                          {movie.status === "completed"
                            ? ""
                            : " / " + movie.episode_total}
                        </span>
                      </>
                    )}
                    {movie.quality && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        <span className="border border-border/60 px-1.5 rounded text-[10px] uppercase tracking-widest text-primary">
                          {movie.quality}
                        </span>
                      </>
                    )}
                    {movie.lang && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        <span className="uppercase text-[10px] tracking-widest">
                          {movie.lang}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {movie.category.map((item, idx) => (
                      <span
                        key={item.slug + idx}
                        className="px-3 py-1 rounded-full border border-border/60 bg-background/40 backdrop-blur-md text-[11px] font-semibold text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap pt-2">
                    <Button
                      aria-label="Xem ngay"
                      name="watch-now"
                      disabled={
                        movie?.episodes[0]?.server_data[0]?.link_m3u8 === ""
                      }
                      onClick={() => {
                        const firstEp = movie.episodes[0].server_data[0];
                        trackMovieView({
                          movieId: movie.slug,
                          source: isPhimApi ? "phimapi" : "ophim",
                          episodeSlug: firstEp.slug,
                          episodeName: firstEp.name,
                        });
                        handleSelectEp(firstEp);
                      }}
                      className="rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary/85 hover:from-primary hover:to-primary text-primary-foreground px-7 py-6 font-bold shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-transform"
                    >
                      <Play className="w-4 h-4 fill-current" /> Xem Ngay
                    </Button>
                    {movie?.trailer_url && (
                      <Modal
                        title={movie.name}
                        trigger={
                          <Button
                            aria-label="Trailer"
                            name="trailer"
                            variant="outline"
                            className="rounded-2xl gap-2 bg-background/40 backdrop-blur-md border-border/60 hover:border-primary/50 px-6 py-6 font-semibold"
                          >
                            <Play className="w-4 h-4" /> Trailer
                          </Button>
                        }
                      >
                        <iframe
                          className="w-[90vw] md:w-[560px] md:h-[315px]"
                          src={`https://www.youtube.com/embed/${movie.trailer_url.split("v=")[1]}`}
                          title="YouTube video player"
                          frameBorder={0}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen={true}
                        ></iframe>
                      </Modal>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        aria-label="Chia sẻ"
                        name="share"
                        onClick={() => {
                          if (movie) {
                            analytics.share({
                              movie_id:
                                movie.tmdb?.id?.toString() ||
                                movie._id ||
                                movie.slug,
                              movie_title: movie.name,
                              movie_slug: movie.slug,
                              source: isPhimApi ? "phimapi" : "ophim",
                              share_method: "native",
                            });
                            trackMovieView({
                              movieId: movie.slug,
                              action: "share",
                              source: isPhimApi ? "phimapi" : "ophim",
                            });
                          }
                          navigator
                            .share({
                              title: movie.name,
                              text: movie.name,
                              url: window.location.href,
                            })
                            .catch(() => {
                              navigator.clipboard.writeText(
                                window.location.href,
                              );
                            });
                        }}
                        className="w-12 h-12 rounded-2xl bg-background/40 backdrop-blur-md border border-border/60 hover:border-primary/50 text-foreground transition-all hover:scale-105"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        disabled
                        aria-label="Yêu thích"
                        name="favorite"
                        className="w-12 h-12 rounded-2xl bg-background/40 backdrop-blur-md border border-border/60 text-foreground"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        disabled
                        aria-label="Lưu"
                        name="bookmark"
                        className="w-12 h-12 rounded-2xl bg-background/40 backdrop-blur-md border border-border/60 text-foreground"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 tracking-wider uppercase pt-1">
                    Cập nhật: Tập mới nhất · {movieViewCount} lượt xem
                  </p>
                </div>
              </div>

              {selectedEp && (
                <div className="mb-4">
                  <MoviePlayer
                    src={selectedEp.link_m3u8}
                    key={selectedEp?.slug + selectedServer?.server_name}
                    title={movie.name}
                    selectedEp={selectedEp.name}
                    poster={movie.thumb_url}
                    startTime={savedStartTime}
                    movieId={
                      movie.tmdb?.id?.toString() || movie._id || movie.slug
                    }
                    movieSlug={movie.slug}
                    movieTitle={movie.name}
                    source={isPhimApi ? "phimapi" : "ophim"}
                    adSegments={
                      isPhimApi
                        ? [
                            { start: 5, end: 15, label: "Bỏ qua quảng cáo" },
                            {
                              start: 15 * 60,
                              end: 15 * 60 + 33,
                              label: "Bỏ qua quảng cáo",
                            },
                          ]
                        : []
                    }
                  />
                </div>
              )}

              {/* Tabs */}
              <Tabs
                defaultValue="tapphim"
                className="mb-6 overflow-x-auto scrollbar-hide"
              >
                <TabsList className="bg-secondary/50 border border-border rounded-lg p-1">
                  {MOVIE_DETAIL_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="tapphim" className="mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex gap-2">
                      {movie.episodes.map((item) => (
                        <Button
                          aria-label={item.server_name}
                          name={item.server_name}
                          size="sm"
                          key={item.server_name}
                          onClick={() => setSelectedServer(item)}
                          variant={
                            selectedServer?.server_name === item.server_name
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.server_name}
                        </Button>
                      ))}
                    </span>
                  </div>
                  {selectedServer?.server_data && (
                    <EpisodeList
                      episodes={selectedServer.server_data}
                      selectedEp={selectedEp}
                      onSelectEp={handleSelectEp}
                    />
                  )}
                </TabsContent>

                <TabsContent value="chitiet" className="mt-4 space-y-3">
                  <DetailRow
                    label="Giới thiệu"
                    value={movie.content}
                    isHtml={true}
                  />
                </TabsContent>
                <TabsContent value="cast" className="mt-4">
                  <Cast
                    source={source}
                    loading={loadingCast}
                    peoples={(castData as any)?.data?.peoples || movie?.actor}
                    profile_sizes={(castData as any)?.data?.profile_sizes}
                  />
                </TabsContent>
                <TabsContent value="suggest" className="mt-4">
                  <MovieRecommendations
                    movieSlug={movie.slug}
                    movieName={movie.name}
                    categories={movie.category}
                    countries={movie.country}
                  />
                </TabsContent>
              </Tabs>

              {/* Info */}
              <div className="mb-8 space-y-2 text-sm">
                <DetailRow
                  label="Thể loại"
                  value={movie.category.map((item) => item.name).join(", ")}
                />
                <DetailRow
                  label="Quốc gia"
                  value={movie.country.map((item) => item.name).join(", ")}
                />
              </div>

              {/* Comments */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-base font-semibold text-foreground">
                    💬 Bình luận ({commentCount})
                  </h3>
                </div>
                <CommentComponent
                  movieSlug={movie.slug}
                  onCommentCountChange={setCommentCount}
                />
              </div>

              {/* Recommendations */}
            </div>

            {/* Sidebar */}
            <TrendingMovies
              title="🔥 Top phim được xem nhiều nhất"
              excludeSlug={movie.slug}
              limit={10}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  isHtml = false,
}: {
  label: string;
  value: string[] | string;
  isHtml?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">
        {label}:
      </span>
      {isHtml ? (
        <span
          dangerouslySetInnerHTML={{ __html: value }}
          className="text-foreground/90"
        />
      ) : (
        <span className="text-foreground/90">{value}</span>
      )}
    </div>
  );
}
