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
import MovieRow from "@/components/features/Movies/MovieRow";
import { Cast } from "@/components/features/Movies/Cast";
import { Comment } from "@/components/features/Movies/Comment";

import { MovieDetail, Episode, ServerData } from "@/lib/api/movies/movieInterface";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useMovieRecommendations } from "@/lib/api/movies/movieQuery";

interface MovieDetailClientProps {
  movie: MovieDetail;
}

function MovieDetailContent({ movie }: MovieDetailClientProps) {
  const searchParams = useSearchParams();
  const epParam = searchParams.get("ep");

  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null);

  const { addWatchHistory } = useHistoryStore();
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
  useEffect(() => {
    if (selectedEpisode && movie) {
      addWatchHistory({
        slug: movie.slug,
        name: movie.name,
        thumb_url: movie.thumb_url,
        currentEpSlug: selectedEpisode.slug,
        currentEpName: selectedEpisode.name,
        watchedAt: Date.now(),
        totalEpisodes: allEpisodes.length,
        episode_current: movie.episode_current,
      });
    }
  }, [selectedEpisode, movie, addWatchHistory, allEpisodes.length]);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Poster */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-2 space-y-6">
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

        {/* Player Section */}
        {selectedEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Player
              episode={selectedEpisode}
              movie={movie}
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
                      <AnimatePresence mode="wait">
                        {server.server_data.map((ep) => (
                          <motion.div
                            key={ep.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
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

        {/* Recommendations */}
        <div className="mt-12 pb-12">
          <MovieRow
            title="Phim đề xuất"
            movies={recommendations?.items?.filter((m) => m.slug !== movie.slug) || []}
            isLoading={isLoadingRecommendations}
            type="the-loai"
            type_list={movie?.category?.[0]?.slug || "hanh-dong"}
          />
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
