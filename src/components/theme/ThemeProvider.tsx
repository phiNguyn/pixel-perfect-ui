"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export type Theme = {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
};

export const THEMES: Theme[] = [
  {
    id: "light",
    name: "Vietwo Channel",
    description: "Không phải Vieon",
    color: "#aff33e",
    bgColor: "#0b1519",
  },
  {
    id: "zen-inspired",
    name: "Zen Inspired",
    description: "Vừa thiền vừa coi phim",
    color: "#d1cfc0",
    bgColor: "#141414",
  },
  {
    id: "minimal-neutral",
    name: "Minimal Neutral",
    description: "Minimal và trung tính",
    color: "#f5f5f5",
    bgColor: "#171717",
  },
  {
    id: "midnight-neon",
    name: "Midnight Neon",
    description: "Hồng neon rực rỡ",
    color: "#e91e8c",
    bgColor: "#151518",
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    description: "Xanh dương sâu thẳm",
    color: "#2dc8d8",
    bgColor: "#0d1520",
  },
  {
    id: "whats-app",
    name: "WhatsApp",
    description: "Màu WhatsApp",
    color: "#075e54",
    bgColor: "#0f1a1f",
  },
  {
    id: "royal-dark",
    name: "Royal Dark",
    description: "Vàng hoàng gia",
    color: "#f5c518",
    bgColor: "#111019",
  },
  {
    id: "crimson-dusk",
    name: "Crimson Dusk",
    description: "Đỏ thẫm quý phái",
    color: "#e04e6e",
    bgColor: "#141012",
  },
  {
    id: "cosmic-violet",
    name: "Cosmic Violet",
    description: "Tím vũ trụ",
    color: "#b06cf0",
    bgColor: "#111019",
  },
  {
    id: "ember-orange",
    name: "Ember Orange",
    description: "Cam rực lửa",
    color: "#f07020",
    bgColor: "#141210",
  },
];

function ThemeColorUpdater() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const matched = THEMES.find((t) => t.id === theme);
    const color = matched?.bgColor ?? "#0a0a0a";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", color);
    }
  }, [theme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorUpdater />
      {children}
    </NextThemesProvider>
  );
}
