"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Link2,
  Code2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import MoviePlayer from "@/components/Common/Player";
import WatchMovieLinkSearch from "@/components/features/WatchMovieLink/Search";
import { useSearchParams } from "next/navigation";
import { useQueryNguoncGetMovie } from "@/lib/api/nguonc/nguonc.query";
import { Episode } from "@/lib/api/movies/movieInterface";

export default function WatchByLinkClient() {
  const [m3u8Link, setM3u8Link] = useState("");
  const [embedLink, setEmbedLink] = useState("");
  const [activeM3u8, setActiveM3u8] = useState("");
  const [activeEmbed, setActiveEmbed] = useState("");
  const [activeEpisode, setActiveEpisode] = useState<{
    index: number;
    type: "m3u8" | "embed";
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<"m3u8" | "embed">("m3u8");
  const searchParams = useSearchParams();
  const link = searchParams.get("link");
  const { data: movie, isLoading } = useQueryNguoncGetMovie(link);

  const handlePlayM3u8 = () => {
    if (m3u8Link.trim()) {
      setActiveM3u8(m3u8Link.trim());
      setActiveEmbed("");
      setActiveEpisode(null);
    }
  };

  const handlePlayEmbed = () => {
    if (embedLink.trim()) {
      setActiveEmbed(embedLink.trim());
      setActiveM3u8("");
      setActiveEpisode(null);
    }
  };

  const handleSelectEpisode = (episode: Episode, index: number) => {
    setActiveEpisode({ index, type: playerMode });
    if (playerMode === "m3u8" && episode.link_m3u8) {
      setActiveM3u8(episode.link_m3u8);
      setActiveEmbed("");
    } else if (playerMode === "embed" && episode.link_embed) {
      setActiveEmbed(episode.link_embed);
      setActiveM3u8("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="py-4 md:py-0 flex-col md:flex-row flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          Xem phim với link
        </h1>
        <WatchMovieLinkSearch />
      </div>

      {/* Movie info section */}
      {movie && (
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="flex gap-4">
            <img
              src={movie.poster_url}
              alt={movie.name}
              className="w-32 h-44 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                {movie.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {movie.origin_name}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                {movie.quality && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    {movie.quality}
                  </span>
                )}
                {movie.lang && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    {movie.lang}
                  </span>
                )}
                {movie.time && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    {movie.time}
                  </span>
                )}
                {movie.episode_current && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    {movie.episode_current}
                  </span>
                )}
              </div>
              {movie.actor && movie.actor.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="font-medium">Diễn viên:</span>{" "}
                  {movie.actor.join(", ")}
                </p>
              )}
              {movie.director && movie.director.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Đạo diễn:</span>{" "}
                  {movie.director.join(", ")}
                </p>
              )}
              {movie.content && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                  {movie.content}
                </p>
              )}
            </div>
          </div>

          {/* Episode list */}
          {movie.episodes && movie.episodes.length > 0 && (
            <div className="mt-4">
              {/* Player mode toggle */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">
                  Chế độ phát:
                </span>
                <div className="flex rounded-md border border-border overflow-hidden">
                  <button
                    onClick={() => setPlayerMode("m3u8")}
                    className={`px-3 py-1 text-xs transition-colors flex items-center gap-1 ${
                      playerMode === "m3u8"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    <Link2 className="h-3 w-3" />
                    M3U8
                  </button>
                  <button
                    onClick={() => setPlayerMode("embed")}
                    className={`px-3 py-1 text-xs transition-colors flex items-center gap-1 border-l border-border ${
                      playerMode === "embed"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    <Code2 className="h-3 w-3" />
                    Embed
                  </button>
                </div>
              </div>

              {movie.episodes.map((server, sIndex) => (
                <div key={sIndex} className="mb-3">
                  <p className="text-xs font-medium text-foreground mb-2">
                    {server.server_name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {server.server_data.map((episode, eIndex) => {
                      const globalIndex = sIndex * 1000 + eIndex;
                      const isActive = activeEpisode?.index === globalIndex;
                      const hasM3u8 = !!episode.link_m3u8;
                      const hasEmbed = !!episode.link_embed;
                      const isDisabled =
                        playerMode === "m3u8" ? !hasM3u8 : !hasEmbed;
                      return (
                        <button
                          key={globalIndex}
                          onClick={() =>
                            handleSelectEpisode(episode, globalIndex)
                          }
                          disabled={isDisabled}
                          className={`px-3 py-1.5 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : isDisabled
                                ? "bg-muted/30 text-muted-foreground/50 border-border cursor-not-allowed"
                                : "bg-muted/50 text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {episode.name}
                          {!hasM3u8 && !hasEmbed && (
                            <span className="text-[10px] opacity-50">N/A</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {!isLoading && !movie && (
        <Tabs defaultValue="m3u8" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="m3u8" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link M3U8
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Link Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="m3u8">
            <div className="flex gap-2">
              <Input
                placeholder="Dán link m3u8 vào đây... (vd: https://.../hls.m3u8)"
                value={m3u8Link}
                onChange={(e) => setM3u8Link(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlayM3u8()}
                className="flex-1"
              />
              <Button onClick={handlePlayM3u8} disabled={!m3u8Link.trim()}>
                <Play className="h-4 w-4 mr-1" />
                Phát
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed">
            <div className="flex gap-2">
              <Input
                placeholder="Dán link embed vào đây... (vd: https://.../embed.php?hash=...)"
                value={embedLink}
                onChange={(e) => setEmbedLink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlayEmbed()}
                className="flex-1"
              />
              <Button onClick={handlePlayEmbed} disabled={!embedLink.trim()}>
                <Play className="h-4 w-4 mr-1" />
                Phát
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Player area */}
      <div className="mt-6">
        {activeM3u8 && (
          <div className="rounded-lg overflow-hidden border border-border">
            <MoviePlayer
              src={activeM3u8}
              title={movie?.name || "Xem phim với link"}
            />
          </div>
        )}

        {activeEmbed && (
          <div className="rounded-lg overflow-hidden border border-border aspect-video">
            <iframe
              src={activeEmbed}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {!activeM3u8 && !activeEmbed && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-lg">
            <Play className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">
              {movie
                ? "Chọn tập phim để xem"
                : 'Dán link và nhấn "Phát" để xem phim'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
