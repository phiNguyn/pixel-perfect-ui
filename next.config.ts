import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tree-shake các thư viện lớn -> giảm JS bundle & tăng tốc tải trang.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "recharts",
    ],
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
    unoptimized: true,
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
