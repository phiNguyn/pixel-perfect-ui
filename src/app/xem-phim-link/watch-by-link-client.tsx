"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Link2, Code2 } from "lucide-react";
import MoviePlayer from "@/components/Common/Player";

export default function WatchByLinkClient() {
  const [m3u8Link, setM3u8Link] = useState("");
  const [embedLink, setEmbedLink] = useState("");
  const [activeM3u8, setActiveM3u8] = useState("");
  const [activeEmbed, setActiveEmbed] = useState("");

  const handlePlayM3u8 = () => {
    if (m3u8Link.trim()) {
      setActiveM3u8(m3u8Link.trim());
      setActiveEmbed("");
    }
  };

  const handlePlayEmbed = () => {
    if (embedLink.trim()) {
      setActiveEmbed(embedLink.trim());
      setActiveM3u8("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Play className="h-6 w-6 text-primary" />
        Xem phim với link
      </h1>

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

      {/* Player area */}
      <div className="mt-6">
        {activeM3u8 && (
          <div className="rounded-lg overflow-hidden border border-border">
            <MoviePlayer src={activeM3u8} title="Xem phim với link" />
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
            <p className="text-sm">Dán link và nhấn &quot;Phát&quot; để xem phim</p>
          </div>
        )}
      </div>
    </div>
  );
}
