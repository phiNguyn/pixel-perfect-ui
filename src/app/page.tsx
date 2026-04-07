import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title:
    "Xem phim HD miễn phí - Pinuss Flix | Phim mới, Vietsub chất lượng cao",
  description:
    "Xem phim HD miễn phí tại Pinuss Flix. Kho phim Hàn Quốc, Nhật Bản, Âu Mỹ, Hoạt Hình Vietsub cập nhật liên tục. Xem ngay!",
  alternates: {
    canonical: "https://pinuss-flix.vercel.app/",
  },
  openGraph: {
    title: "Xem phim HD miễn phí - Pinuss Flix",
    description: "Kho phim HD Vietsub chất lượng cao, cập nhật liên tục.",
    type: "website",
    url: "https://pinuss-flix.vercel.app/",
    siteName: "Pinuss Flix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xem phim HD miễn phí - Pinuss Flix",
    description: "Kho phim HD Vietsub chất lượng cao, cập nhật liên tục.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
