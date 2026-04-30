"use client";

import "@videojs/react/video/skin.css";
import {
  createPlayer,
  selectTime,
  usePlayer,
  videoFeatures,
} from "@videojs/react";
import { VideoSkin } from "@videojs/react/video";
import { HlsVideo } from "@videojs/react/media/hls-video";

const Player = createPlayer({ features: videoFeatures });

interface MyPlayerProps {
  src: string;
  poster?: string;
  startTime?: number;
  title?: string;
}

export const MyPlayer = ({ src, poster, startTime, title }: MyPlayerProps) => {
  return (
    <Player.Provider>
      <VideoSkin poster={poster}>
        <HlsVideo src={src} playsInline title={title} />
      </VideoSkin>
    </Player.Provider>
  );
};
