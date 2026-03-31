"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type Theme = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "Vieone Channel",
    description: "Vieone channel",
    color: "#aff33e",
  },
  {
    id: "zen-inspired",
    name: "Zen Inspired",
    description: "Vừa thiền vừa coi phim",
    color: "#d1cfc0",
  },
  {
    id: "minimal-neutral",
    name: "Minimal Neutral",
    description: "Minimal và trung tính",
    color: "#f5f5f5",
  },
  {
    id: "midnight-neon",
    name: "Midnight Neon",
    description: "Hồng neon rực rỡ",
    color: "#e91e8c",
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    description: "Xanh dương sâu thẳm",
    color: "#2dc8d8",
  },
  {
    id: "whats-app",
    name: "WhatsApp",
    description: "Màu WhatsApp",
    color: "#075e54",
  },
  {
    id: "royal-dark",
    name: "Royal Dark",
    description: "Vàng hoàng gia",
    color: "#f5c518",
  },
  {
    id: "crimson-dusk",
    name: "Crimson Dusk",
    description: "Đỏ thẫm quý phái",
    color: "#e04e6e",
  },
  {
    id: "cosmic-violet",
    name: "Cosmic Violet",
    description: "Tím vũ trụ",
    color: "#b06cf0",
  },
  {
    id: "ember-orange",
    name: "Ember Orange",
    description: "Cam rực lửa",
    color: "#f07020",
  },
];

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
