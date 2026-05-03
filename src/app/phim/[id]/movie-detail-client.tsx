/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, Heart, Share2, BookmarkPlus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useMemo, useState, useRef } from "react";
import { featuredMovies, topMovies } from "@/data/movies";
import { useQueryMovie, useQueryPhimApi } from "@/lib/api/movies/movieQuery";
import {
  Episode,
  convertPhimApiToIMovieDetail,
} from "@/lib/api/movies/movieInterface";
import MoviePlayer from "@/components/Common/Player";
import Cast from "@/components/features/Movies/Cast";
import { useHistoryStore } from "@/stores/useHistoryStore";
import MovieImage from "@/components/features/Movies/MovieImage";
import { Modal } from "@/components/Common/Modal";
import MovieDetailSkeleton from "@/components/features/Movies/Skeletons/MovieDetailSkeleton";
import MovieNotFound from "@/components/features/Movies/MovieNotFound";
import { normalizeEpisode } from "@/lib/utils";
import { CommentComponent } from "@/components/features/Movies/Comment";
import { analytics } from "@/lib/analytics";

export default function MovieDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams?.get("source") ?? "ophim";
  const isPhimApi = source === "phimapi";
  const previousEpRef = useRef<string | null>(null);

  const {
    data: rawData,
    isLoading,
    isError,
  } = useQueryMovie(id as string, undefined, source);
  const {
    data: rawDataPhimApi,
    isError: isErrorPhimApi,
    isLoading: isLoadingPhimApi,
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

  // 👉 loading + error theo source
  const loading = isPhimApi ? isLoadingPhimApi : isLoading;
  const loadingCast = isPhimApi ? isLoadingPhimApi : isLoadingCast;
  const error = isPhimApi ? isErrorPhimApi : isError;

  // 👉 breadcrumb
  const breadCrumb = isPhimApi
    ? movie?.category.map((item) => ({
        name: item.name,
        slug: "/the-loai/" + item.slug,
      }))
    : (movieData?.data?.breadCrumb as any[]);
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

  // Track movie view on mount
  useEffect(() => {
    if (movie) {
      analytics.movieView({
        movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
        movie_title: movie.name,
        movie_slug: movie.slug,
        source: isPhimApi ? "phimapi" : "ophim",
      });
    }
  }, [movie?.slug, isPhimApi]);

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
        thumb_url: movie.thumb_url,
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
      router.back();
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
  if (error) return <MovieNotFound type="error" slug={id} />;
  if (!movie) return <MovieNotFound type="not-found" slug={id} />;
  return (
    <>
      <div className="mb-4">
        {/* Hero backdrop */}
        <div className="relative w-full h-[320px] md:h-[calc(100vh-128px)]">
          <img
            width={1920}
            height={1080}
            // quality={75}
            loading="lazy"
            src={getPosterUrl("poster")}
            alt={movie.name + " poster"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" /> */}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 -mt-48 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {/* Movie header */}
              <div className="flex mt-28 md:mt-0 flex-col md:flex-row gap-3 md:gap-5 mb-6">
                <div className="w-100 flex items-center justify-center">
                  <div className="w-[120px] md:w-[150px] aspect-[2/3] rounded-lg overflow-hidden shadow-[var(--shadow-card)] flex-shrink-0">
                    <MovieImage
                      movie={movie}
                      source={isPhimApi ? "phimapi" : "ophim"}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Button
                      aria-label="Xem ngay"
                      name="watch-now"
                      disabled={
                        movie?.episodes[0]?.server_data[0]?.link_m3u8 === ""
                      }
                      onClick={() =>
                        handleSelectEp(movie.episodes[0].server_data[0])
                      }
                      className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6"
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
                            onClick={() => {
                              if (movie) {
                                analytics.trailerView({
                                  movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
                                  movie_title: movie.name,
                                  movie_slug: movie.slug,
                                });
                              }
                            }}
                          >
                            <Play className="w-4 h-4 fill-current" /> Trailer
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
                              movie_id: movie.tmdb?.id?.toString() || movie._id || movie.slug,
                              movie_title: movie.name,
                              movie_slug: movie.slug,
                              source: isPhimApi ? "phimapi" : "ophim",
                              share_method: "native",
                            });
                          }
                          navigator.share({
                            title: movie.name,
                            text: movie.name,
                            url: window.location.href,
                          }).catch(() => {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(window.location.href);
                          });
                        }}
                        className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        disabled
                        aria-label="Yêu thích"
                        name="favorite"
                        className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        disabled
                        aria-label="Lưu"
                        name="bookmark"
                        className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                      {movie.name}
                    </h1>
                    <div className="text-2xl md:text-3xl text-primary   mb-2">
                      {movie?.origin_name}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      {movie.tmdb.vote_average}
                    </Badge>
                    {movie.episode_current && (
                      <Badge variant="default" className="text-xs">
                        {movie.episode_current}{" "}
                        {movie.episode_total === "1"
                          ? ""
                          : " / " + movie.episode_total}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {movie.year}
                    </Badge>
                    {movie.category.map((item, idx) => (
                      <Badge
                        key={item.id + idx}
                        variant="secondary"
                        className="text-xs"
                      >
                        {item.name}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      {movie.quality}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {movie.lang}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Cập nhật: Tập mới nhất · Lịch chiếu
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />

                    <span>Số lượt xem: {movie.view}</span>
                  </div>
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
                    movieId={movie.tmdb?.id?.toString() || movie._id || movie.slug}
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
                  <TabsTrigger
                    value="tapphim"
                    className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Tập phim
                  </TabsTrigger>
                  <TabsTrigger
                    value="chitiet"
                    className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Chi tiết
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Gallery
                  </TabsTrigger>

                  {/* <TabsTrigger
                    value="soundtrack"
                    className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Soundtrack
                  </TabsTrigger>
                  <TabsTrigger
                    value="giaisuat"
                    className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Giải suất
                  </TabsTrigger> */}
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
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {selectedServer?.server_data.map((item: Episode, idx) => {
                      if (!item.slug) return null;
                      return (
                        <button
                          aria-label={item.name}
                          name={item.name}
                          key={item.name + idx}
                          onClick={() => handleSelectEp(item)}
                          className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded text-xs font-medium transition-colors ${
                            selectedEp?.slug === item.slug
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-muted"
                          }`}
                        >
                          <Play className="w-2.5 h-2.5" />
                          {"Tập " + normalizeEpisode(item.name)}
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="chitiet" className="mt-4 space-y-3">
                  <DetailRow
                    label="Giới thiệu"
                    value={movie.content}
                    isHtml={true}
                  />
                </TabsContent>
                <TabsContent value="gallery" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Chưa có hình ảnh
                  </p>
                </TabsContent>
                {/* <TabsContent value="soundtrack" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Chưa có soundtrack
                  </p>
                </TabsContent>
                <TabsContent value="giaisuat" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Chưa có thông tin giải suất
                  </p>
                </TabsContent> */}
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

              <Cast
                source={source}
                loading={loadingCast}
                peoples={
                  isPhimApi
                    ? movie?.actor
                    : isErrorCast
                      ? movie?.actor
                      : (castData as any)?.data?.peoples
                }
                profile_sizes={
                  isPhimApi ? [] : (castData as any)?.data?.profile_sizes
                }
              />

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
            </div>

            {/* Sidebar */}
            <aside className="lg:w-[300px] flex-shrink-0 hidden md:block">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                🔥Top phim tuần này (này ảo thui)
              </h3>
              <div className="space-y-3">
                {topMovies.concat(featuredMovies.slice(0, 5)).map((m, i) => (
                  <div
                    key={`${m.id}-${i}`}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <span
                      className={`text-lg font-black w-6 text-center flex-shrink-0 ${i < 3 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {i + 1}
                    </span>
                    <img
                      loading="lazy"
                      width={48}
                      height={64}
                      // quality={80}
                      src={m.image}
                      alt={m.title}
                      className="w-12 h-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {m.year} · {m.country}
                      </p>
                      {m.episodes && (
                        <p className="text-[10px] text-muted-foreground">
                          {m.episodes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
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
