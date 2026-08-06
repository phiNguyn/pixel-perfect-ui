"use client";

import HeroBanner from "@/components/features/Home/HeroBanner";
import LazyMovieRow from "@/components/features/Home/LazyMovieRow";
import WatchHistoryRow from "@/components/features/Home/WatchHistoryRow";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";
import StreakHomeCard from "@/components/features/Streak/StreakHomeCard";

import { MovieCategory } from "@/lib/api/movies/movieInterface";

export default function HomeClient() {
  return (
    <>
      <HeroBanner />
      <div className="px-4 md:px-16">
        <StreakHomeCard />
        <LoginBenefitsCard storageKey="home-hero" />
        <WatchHistoryRow />
        <LazyMovieRow
          title="Phim Mới Cập Nhật"
          cacheKey={MovieCategory.PHIM_MOI}
          slug={"danh-sach/" + MovieCategory.PHIM_MOI}
          type={"danh-sach/" + MovieCategory.PHIM_MOI}
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
