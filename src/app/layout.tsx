import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/layouts/SiteHeader";
import SiteFooter from "@/components/layouts/SiteFooter";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Script from "next/script";
import { GlobalModals } from "@/components/GlobalModals";
// Force dynamic rendering to prevent prerendering issues with /_not-found
export const dynamic = "force-dynamic";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="yTcodZRIQIBV8BDtfje8c5uvLUwnACfh1NNtVYPULhU"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Pinuss Flix" />
      </head>
      <body className="min-h-screen bg-background flex flex-col antialiased">
        <Providers>
          <ThemeProvider
            attribute="theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            <main className="flex-1 md:pb-0">{children}</main>
            <SiteFooter />
            <GlobalModals />
            <SonnerToaster />
          </ThemeProvider>
        </Providers>
        <Toaster />
        <Analytics />
        <Script
          src="https://api.getbeam.fyi/pixel/tracker.js"
          data-site="site_51f899671d50"
          data-api="https://api.getbeam.fyi"
          data-identity-providers='[{"type":"leadpipe","id":"95247db8-8d49-4213-8ea7-ee0a6dd0ae78"}]'
          strategy="afterInteractive"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
