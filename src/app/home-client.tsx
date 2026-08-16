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
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-12 md:px-8 lg:px-12">
        <div className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Dành cho bạn</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:text-2xl">Tìm bộ phim tiếp theo</h1>
          </div>
          <div className="flex items-center gap-2">
            <StreakHomeCard />
            <LoginBenefitsCard storageKey="home-hero" />
          </div>
        </div>
        <WatchHistoryRow />
        <LazyMovieRow
          title="Đang thịnh hành"
          cacheKey="trending"
          slug="trending"
          type="danh-sach"
        />
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
      </main>
    </>
  );
}
