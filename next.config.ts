import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ];
  },
  images: {
    qualities: [25, 50, 75, 80, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "phimimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phim.nguonc.com",
        pathname: "/public/images/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
