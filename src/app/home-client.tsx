"use client";

import HeroBanner from "@/components/features/Home/HeroBanner";
import MoodSection from "@/components/features/Home/MoodSection";
import LazyMovieRow from "@/components/features/Home/LazyMovieRow";
import WatchHistoryRow from "@/components/features/Home/WatchHistoryRow";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";

import { MovieCategory } from "@/lib/api/movies/movieInterface";

export default function HomeClient() {
  return (
    <>
      <HeroBanner />
      <div className="md:px-16">
        <LoginBenefitsCard storageKey="home-hero" />
        <MoodSection />
        <WatchHistoryRow />
        <LazyMovieRow
          title="Phim Mới Cập Nhật"
          cacheKey={MovieCategory.PHIM_MOI}
          slug={"danh-sach/" + MovieCategory.PHIM_MOI}
          type="danh-sach"
        />
        <LazyMovieRow
          title="Phim Hàn Quốc Mới"
          cacheKey="quoc-gia/han-quoc"
          slug="quoc-gia/han-quoc"
        />
        <LazyMovieRow
          title="Phim Nhật Bản mới"
          cacheKey="quoc-gia/nhat-ban"
          slug="quoc-gia/nhat-ban"
        />
        <LazyMovieRow
          title="Phim Mỹ, Âu Mới"
          cacheKey="quoc-gia/au-my"
          slug="quoc-gia/au-my"
        />
        <LazyMovieRow
          title="Phim Hoạt Hình"
          cacheKey="danh-sach/hoat-hinh"
          slug="danh-sach/hoat-hinh"
          type="danh-sach"
        />
      </div>
    </>
  );
}
