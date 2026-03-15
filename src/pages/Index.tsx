import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import MoodSection from "@/components/MoodSection";
import MovieRow from "@/components/MovieRow";
import SiteFooter from "@/components/SiteFooter";
import {
  featuredMovies,
  koreanMovies,
  chineseMovies,
  usMovies,
  animeMovies,
  topMovies,
} from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroBanner />
      <MoodSection />
      <MovieRow title="Phim Mới Cập Nhật" movies={featuredMovies} />
      <MovieRow title="Phim Hàn Quốc Mới" movies={koreanMovies} />
      <MovieRow title="Phim Trung Quốc Mới" movies={chineseMovies} />
      <MovieRow title="Phim Mỹ, Âu Mới" movies={usMovies} />
      <MovieRow title="Anime Hay" movies={animeMovies} />
      <MovieRow title="Top 10 Phim Kế Bên Nay" movies={topMovies} showRank />
      <SiteFooter />
    </div>
  );
};

export default Index;
