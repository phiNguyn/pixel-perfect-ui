import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers";
import SiteHeader from "@/components/layouts/SiteHeader";
import SiteFooter from "@/components/layouts/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Xem phim HD miễn phí - Pinuss Flix",
    template: "%s | Pinuss Flix",
  },
  description:
    "Xem phim HD miễn phí tại Pinuss Flix. Kho phim Hàn Quốc, Nhật Bản, Âu Mỹ, Hoạt Hình Vietsub cập nhật liên tục.",
  keywords: [
    "xem phim",
    "phim HD",
    "phim vietsub",
    "phim Hàn Quốc",
    "phim Nhật Bản",
    "phim mới",
    "Pinuss Flix",
  ],
  authors: [{ name: "Pinuss Flix" }],
  creator: "Pinuss Flix",
  metadataBase: new URL("https://pinuss-flix.vercel.app"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://pinuss-flix.vercel.app",
    siteName: "Pinuss Flix",
    title: "Xem phim HD miễn phí - Pinuss Flix",
    description:
      "Kho phim HD Vietsub chất lượng cao, cập nhật liên tục. Xem ngay!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xem phim HD miễn phí - Pinuss Flix",
    description:
      "Kho phim HD Vietsub chất lượng cao, cập nhật liên tục. Xem ngay!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e11d48",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background flex flex-col antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
