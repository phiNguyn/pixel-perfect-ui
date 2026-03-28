"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Play, Calendar, Clock, Film, Star, Globe, Tag, Users, Clapperboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import BreadCrumb from "@/components/Common/BreadCrumb";
import Player from "@/components/Common/Player";

import { Episode, IMovieDetail, EpisodeServer, Movie } from "@/lib/api/movies/movieInterface";
import { useHistoryStore, getWatchHistory } from "@/stores/useHistoryStore";
import Comment from "@/components/features/Movies/Comment";
import Cast from "@/components/features/Movies/Cast";
import { useMovieRecommendations } from "@/lib/api/movies/movieQuery";

interface MovieDetailClientProps {
  movie: IMovieDetail;
}

/** Ảnh thumb cho sidebar / card nhỏ */
function movieThumbSrc(m: Movie) {
  if (!m?.thumb_url) return "";
  return m.thumb_url.startsWith("http")
    ? m.thumb_url
    : `https://img.ophim.live/uploads/movies/${m.thumb_url}`;
}

/** Sidebar phim đề xuất dạng bảng xếp hạng dọc (giống layout tham khảo) */
function MovieRecommendationsSidebar({
  movies,
  loading,
  type,
  typeList,
}: {
  movies: Movie[];
  loading: boolean;
  type: string;
  typeList: string;
}) {
  return (
    <aside className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:flex lg:flex-col">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <span className="text-lg" aria-hidden>
          🔥
        </span>
        <h2 className="text-base font-semibold text-foreground tracking-tight">Phim đề xuất</h2>
      </div>

      <ScrollArea className="lg:flex-1 lg:min-h-0 -mx-1 px-1">
        <ul className="space-y-3 pb-2">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex gap-3 items-center">
                <Skeleton className="h-8 w-6 shrink-0 rounded" />
                <Skeleton className="h-14 w-12 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </li>
            ))
            : movies.length === 0
              ? (
                <li className="text-sm text-muted-foreground py-6 text-center">Chưa có phim đề xuất</li>
              )
              : movies.slice(0, 8).map((m, i) => {
                const rank = i + 1;
                const countryLine = m.country?.map((c) => c.name).join(", ") || "";
                const meta = [m.year, countryLine, m.episode_current].filter(Boolean).join(" • ");
                return (
                  <li key={m._id}>
                    <Link
                      href={`/phim/${m.slug}`}
                      className="flex gap-3 items-center rounded-lg p-1.5 -mx-1.5 hover:bg-muted/60 transition-colors group"
                    >
                      <span
                        className="w-7 shrink-0 text-center text-xl font-black tabular-nums text-primary leading-none"
                        style={{ textShadow: "0 0 1px hsl(var(--foreground))" }}
                      >
                        {rank}
                      </span>
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        <img
                          src={`${movieThumbSrc(m)}?w=200&q=75`}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {m.name}
                        </p>
                        {meta && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{meta}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
        </ul>
      </ScrollArea>

      <Link
        href={`/${type}/${typeList}`}
        className="mt-3 pt-3 border-t border-border/50 text-center text-xs font-medium text-primary hover:underline shrink-0"
      >
        Xem thêm
      </Link>
    </aside>
  );
}

function MovieDetailContent({ movie }: MovieDetailClientProps) {
  const searchParams = useSearchParams();
  const epParam = searchParams.get("ep");

  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<EpisodeServer | null>(null);

  const { addWatchHistory, updateWatchProgress, watchHistory } = useHistoryStore();
  const { data: recommendations, isLoading: isLoadingRecommendations } = useMovieRecommendations(movie?.category?.[0]?.slug || "hanh-dong");
  // Get episodes from all servers
  const allEpisodes = useMemo(() => {
    if (!movie?.episodes?.length) return [];
    return movie.episodes.flatMap((server) => server.server_data);
  }, [movie?.episodes]);

  // Set initial episode based on URL param or first episode
  useEffect(() => {
    if (!movie?.episodes?.length) return;

    const firstServer = movie.episodes[0];
    setSelectedServer(firstServer);

    if (epParam && allEpisodes.length > 0) {
      const foundEp = allEpisodes.find((ep) => ep.slug === epParam);
      if (foundEp) {
        setSelectedEpisode(foundEp);
        return;
      }
    }

    if (firstServer?.server_data?.length > 0) {
      setSelectedEpisode(firstServer.server_data[0]);
    }
  }, [movie?.episodes, epParam, allEpisodes]);

  // Save watch history when episode changes
  // Only preserves currentTime when switching server (same episode name); resets to 0 when changing episode
  useEffect(() => {
    if (selectedEpisode && movie) {
      const existing = getWatchHistory().find((h) => h.slug === movie.slug);
      // Preserve time only if same episode name (server switch), otherwise reset
      const currentSavedTime =
        existing && existing.currentEpName === selectedEpisode.name
          ? existing.currentTime
          : 0;

      addWatchHistory({
        slug: movie.slug,
        name: movie.name,
        thumb_url: movie.thumb_url,
        origin_name: movie.origin_name,
        year: movie.year,
        quality: movie.quality,
        currentTime: currentSavedTime,
        duration: 0,
        currentEpSlug: selectedEpisode.slug,
        currentEpName: selectedEpisode.name,
        currentServerName: selectedServer?.server_name ?? "",
        watchedAt: Date.now(),
        episode_current: movie.episode_current,
      });
    }
  }, [selectedEpisode, movie, addWatchHistory]);

  // Listen to player progress and save to store
  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const { currentTime, duration } = (e as CustomEvent).detail;
      if (movie?.slug) {
        updateWatchProgress(movie.slug, currentTime, duration);
      }
    };
    window.addEventListener("player-time-update", handleTimeUpdate);
    return () => window.removeEventListener("player-time-update", handleTimeUpdate);
  }, [movie?.slug, updateWatchProgress]);

  // Get saved time for current episode
  const savedTime = movie
    ? watchHistory.find((h) => h.slug === movie.slug)?.currentTime ?? 0
    : 0;

  // Sync episode when server changes — same slug → match by name → first episode
  useEffect(() => {
    if (!selectedServer?.server_data?.length) return;
    const newServerData = selectedServer.server_data;

    // 1. Same episode slug
    const sameEp = newServerData.find((ep) => ep.slug === selectedEpisode?.slug);
    if (sameEp) {
      setSelectedEpisode(sameEp);
      return;
    }

    // 2. Same episode name (handles API slug variations between servers)
    const currentName = selectedEpisode?.name;
    if (currentName) {
      const byName = newServerData.find((ep) => ep.name === currentName);
      if (byName) {
        setSelectedEpisode(byName);
        return;
      }
    }

    // 3. Fallback: first episode
    setSelectedEpisode(newServerData[0]);
  }, [selectedServer]);

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode);
    window.history.replaceState(null, "", `/phim/${movie.slug}?ep=${episode.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadCrumb = [
    { position: 1, name: movie?.type === "single" ? "Phim lẻ" : "Phim bộ", slug: movie?.type === "single" ? "/phim-le" : "/phim-bo", isCurrent: false },
    { position: 2, name: movie?.name || "", isCurrent: true },
  ];

  const posterUrl = movie?.poster_url?.startsWith("http") ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie?.poster_url}`;
  const thumbUrl = movie?.thumb_url?.startsWith("http") ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie?.thumb_url}`;

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-[30vh] relative z-10">
        <BreadCrumb breadCrumb={breadCrumb} />

        {/* Content - Full Width (no sidebar) */}
        <div className="mt-6 space-y-8">
          {/* Movie Poster + Info */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Poster */}
              <div className="shrink-0 w-full max-w-[200px] sm:max-w-[220px] mx-auto sm:mx-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={posterUrl}
                    alt={movie.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {movie.quality && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      {movie.quality}
                    </Badge>
                  )}
                  {movie.lang && (
                    <Badge variant="secondary" className="absolute top-3 right-3">
                      {movie.lang}
                    </Badge>
                  )}
                </motion.div>
              </div>

              {/* Movie Info */}
              <div className="flex-1 min-w-0 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {movie.name}
                  </h1>
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <p className="text-lg text-muted-foreground">{movie.origin_name}</p>
                  )}
                </motion.div>

                {/* Rating & Year */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  {movie.tmdb?.vote_average && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{movie.tmdb.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  {movie.year && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{movie.year}</span>
                    </div>
                  )}
                  {movie.time && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{movie.time}</span>
                    </div>
                  )}
                  {movie.episode_current && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Film className="w-4 h-4" />
                      <span>{movie.episode_current}</span>
                    </div>
                  )}
                </motion.div>

                {/* Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2"
                >
                  {movie.category?.map((cat) => (
                    <Link key={cat.slug} href={`/the-loai/${cat.slug}`}>
                      <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div
                    className={`text-muted-foreground leading-relaxed ${!showFullContent ? "line-clamp-4" : ""}`}
                    dangerouslySetInnerHTML={{ __html: movie.content || "Chưa có mô tả" }}
                  />
                  {movie.content && movie.content.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="mt-2 text-primary"
                    >
                      {showFullContent ? (
                        <>Thu gọn <ChevronUp className="w-4 h-4 ml-1" /></>
                      ) : (
                        <>Xem thêm <ChevronDown className="w-4 h-4 ml-1" /></>
                      )}
                    </Button>
                  )}
                </motion.div>

                {/* Movie Details Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                >
                  {movie.country?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Quốc gia: </span>
                        {movie.country.map((c, i) => (
                          <span key={c.slug}>
                            <Link href={`/quoc-gia/${c.slug}`} className="text-primary hover:underline">
                              {c.name}
                            </Link>
                            {i < movie.country.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {movie.director?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Clapperboard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Đạo diễn: </span>
                        <span>{movie.director.join(", ")}</span>
                      </div>
                    </div>
                  )}
                  {movie.actor?.length > 0 && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Diễn viên: </span>
                        <span>{movie.actor.slice(0, 5).join(", ")}{movie.actor.length > 5 && "..."}</span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Play Button */}
                {selectedEpisode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button size="lg" className="gap-2">
                      <Play className="w-5 h-5 fill-current" />
                      Xem phim
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        {selectedEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Player
              episode={selectedEpisode}
              movie={movie}
              startTime={savedTime}
              onEpisodeChange={handleEpisodeSelect}
            />
          </motion.div>
        )}

        {/* Episodes Section */}
        {movie.episodes && movie.episodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Tabs defaultValue={movie.episodes[0]?.server_name} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Danh sách tập</h2>
                <TabsList className="bg-muted/50">
                  {movie.episodes?.map((server) => (
                    <TabsTrigger
                      key={server.server_name}
                      value={server.server_name}
                      onClick={() => setSelectedServer(server)}
                    >
                      {server.server_name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {movie.episodes?.map((server) => (
                <TabsContent key={server.server_name} value={server.server_name} className="mt-0">
                  <ScrollArea className="w-full rounded-lg border border-border/50 p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                      <AnimatePresence>
                        {server.server_data?.map((episode, idx) => (
                          <motion.button
                            key={episode.slug}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => handleEpisodeSelect(episode)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              selectedEpisode?.slug === episode.slug
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                          >
                            {episode.name}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}

        {/* Cast & Comments Tabs */}
        {(movie?.actor?.length > 0 || true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Tabs defaultValue="cast" className="w-full">
              <TabsList className="bg-muted/50">
                {movie?.actor?.length > 0 && <TabsTrigger value="cast">Diễn viên</TabsTrigger>}
                <TabsTrigger value="comments">Bình luận</TabsTrigger>
              </TabsList>

              {movie?.actor?.length > 0 && (
                <TabsContent value="cast" className="mt-6">
                  <Cast actors={movie.actor} />
                </TabsContent>
              )}

              <TabsContent value="comments" className="mt-6">
                <Comment />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Recommendations Section - Below everything */}
        {recommendations?.items && recommendations.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Phim đề xuất</h2>
              <Link
                href={`/the-loai/${movie?.category?.[0]?.slug || "hanh-dong"}`}
                className="text-sm text-primary hover:underline"
              >
                Xem thêm →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.items
                .filter((m) => m.slug !== movie.slug)
                .slice(0, 10)
                .map((m) => (
                  <Link key={m._id} href={`/phim/${m.slug}`} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                      <img
                        src={`${movieThumbSrc(m)}?w=300&q=75`}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {m.quality && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                          {m.quality}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {m.name}
                    </p>
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
          </div>
        </div>
      </div>
    </div>
  );

        {/* Episodes Section */}
        {movie.episodes && movie.episodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Tabs defaultValue={movie.episodes[0]?.server_name} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Danh sách tập</h2>
                <TabsList className="bg-muted/50">
                  {movie.episodes.map((server) => (
                    <TabsTrigger
                      key={server.server_name}
                      value={server.server_name}
                      onClick={() => setSelectedServer(server)}
                    >
                      {server.server_name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {movie.episodes.map((server) => (
                <TabsContent key={server.server_name} value={server.server_name}>
                  <ScrollArea className="w-full">
                    <div className="flex flex-wrap gap-2 pb-4">
                      <AnimatePresence>
                        {server.server_data.map((ep) => (
                          <motion.div
                            key={ep.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                          >
                            <Button
                              variant={selectedEpisode?.slug === ep.slug ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleEpisodeSelect(ep)}
                              className="min-w-[60px]"
                            >
                              {ep.name}
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}

        {/* Tabs for Cast & Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Tabs defaultValue="cast" className="w-full">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="cast">Diễn viên</TabsTrigger>
              <TabsTrigger value="comments">Bình luận</TabsTrigger>
            </TabsList>
            <TabsContent value="cast" className="mt-4">
              <Cast actors={movie.actor || []} />
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <Comment movieSlug={movie.slug} />
            </TabsContent>
          </Tabs>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    }>
      <MovieDetailContent movie={movie} />
    </Suspense>
  );
}
