/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link, useSearchParams } from "react-router-dom";
import SiteHeader from "@/components/layouts/SiteHeader";
import SiteFooter from "@/components/layouts/SiteFooter";
import { Play, Heart, Share2, BookmarkPlus, Star, ThumbsUp, ThumbsDown, MessageCircle, ChevronRight, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { featuredMovies, koreanMovies, chineseMovies, topMovies } from "@/data/movies";
import { useQueryMovie } from "@/lib/api/movies/movieQuery";
import { Episode, IMovieDetail } from "@/lib/api/movies/movieInterface";
import MoviePlayer from "@/components/Common/Player";
import Cast from "@/components/features/Movies/Cast";
import Comment from "@/components/features/Movies/Comment";
import { Helmet } from "react-helmet-async";
import BreadCrumb from "@/components/Common/BreadCrumb";


const sampleComments = [
  { user: "khanhchi1", time: "3 ngày trước", text: "Phim hay quá, xem mãi không chán 😍", likes: 12 },
  { user: "hải", time: "5 ngày trước", text: "Mới xem tới tập 12 chưa biết sau thế nào", likes: 8 },
  { user: "Rose81", time: "1 tuần trước", text: "Phim hay thật sự, ai chưa xem thì xem đi 👍", likes: 15 },
  { user: "phacodemap", time: "2 tuần trước", text: "Vừa xem tập 15 và nó quá rất sốc nhé mọi người! Cần phải dừng lại để hít thở phản hồi!", likes: 24 },
  { user: "Nguyễn Anh Thư", time: "3 tuần trước", text: "uuuuuuuu film này coi cực nghiện luôn nha mng ơi", likes: 6 },
  { user: "bạch loan hồng", time: "1 tháng trước", text: "Film này quá đỉnh", likes: 3 },
  { user: "khánh lý", time: "2 tháng trước", text: "mới xem phim, chiếu ở mọc 🫠", likes: 9 },
  { user: "my", time: "2 tháng trước", text: "Coi là bị lọt 'hole' luôn! Ai biết xem ở đâu thì chỉ mình với 😅 phim hay ghê đi quá rất tuyệt vời luôn", likes: 31 },
];

export default function MovieDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQueryMovie(id)
  const movie = data?.data?.item as IMovieDetail
  const seoOnPage = data?.data?.seoOnPage
  const [searchParams, setSearchParams] = useSearchParams();
  const epFromUrl = searchParams.get("ep");

  const { data: cast, isLoading: castLoading } = useQueryMovie(id, '/peoples')
  const peoples = cast?.data?.peoples ?? []
  const profile_sizes = cast?.data?.profile_sizes ?? []

  const [selectedEp, setSelectedEp] = useState<Episode>();
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const breadCrumb = data?.data?.breadCrumb
  useEffect(() => {
    if (movie?.episodes?.length) {
      setSelectedServer(movie.episodes[0]);
    }
  }, [movie]);
  const [commentText, setCommentText] = useState("");

  const totalEps = movie?.episode_total ? parseInt(movie.episode_total.replace(/[^\d]/g, "")) || 24 : 1;
  const handleSelectEp = (ep: Episode) => {
    setSelectedEp(ep);
    setSearchParams({
      ep: ep.slug // hoặc ep.number
    });
  };

  useEffect(() => {
    if (!movie || !selectedServer) return;

    const epSlug = searchParams.get("ep");
    if (!epSlug) return;

    const ep = selectedServer.server_data.find(
      (e) => e.slug === epSlug
    );

    if (ep) setSelectedEp(ep);
  }, [movie, selectedServer, searchParams]);
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
  return (
    <>
      {isLoading ?
        <Loader />
        :
        <>
          <Helmet>
            <title>{movie.name} - Pinuss Flix</title>
            <meta property="og:title" content={movie.name} />
            <meta property="og:image" content={`https://img.ophim.live/uploads/movies/${movie?.poster_url ?? movie.thumb_url}`} />
            <meta property="og:description" content={seoOnPage?.descriptionHead} />
          </Helmet>
          <div className="py-2 px-4 max-w-[1400px] mx-auto"><BreadCrumb breadCrumb={breadCrumb} /></div>
          <div className="my-4">
            {/* Hero backdrop */}
            <div className="relative w-full h-[320px] md:h-[400px]">
              <img src={`https://img.ophim.live/uploads/movies/${movie?.poster_url ?? movie.thumb_url}`} alt={movie.name} className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 -mt-48 relative z-10">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Main content */}
                <div className="flex-1">
                  {/* Movie header */}
                  <div className="flex mt-28 md:mt-0 flex-col md:flex-row gap-3 md:gap-5 mb-6">
                    <div className="w-100 flex items-center justify-center">
                      <img
                        src={`https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
                        alt={movie.name}
                        className="w-[120px] md:w-[150px] aspect-[2/3] rounded-lg object-cover shadow-[var(--shadow-card)] flex-shrink-0"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <Button disabled={movie?.episodes[0].server_data[0].link_m3u8 === ''} onClick={() => setSelectedEp(movie.episodes[0].server_data[0])} className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                          <Play className="w-4 h-4 fill-current" /> Xem Ngay
                        </Button>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                          <Badge variant="outline" className="border-primary text-primary ml-2">HD</Badge>
                        </div>
                      </div>

                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{movie.name}</h1>
                      <p className="text-sm text-muted-foreground mb-2">{movie.lang}</p>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-accent text-accent-foreground text-xs">{movie.tmdb.vote_average}</Badge>
                        <Badge variant="secondary" className="text-xs">{movie.year}</Badge>
                        {movie.category.map(item => (
                          <Badge key={item.id} variant="secondary" className="text-xs">{item.name}</Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs">{movie.quality}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Cập nhật: Tập mới nhất · Lịch chiếu
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>Số tập:  {movie?.episode_current}</span>
                        <span>Số lượt xem: {movie.view}</span>
                      </div>
                    </div>
                  </div>
                  {selectedEp && <div className="mb-4"><MoviePlayer src={selectedEp.link_m3u8} key={selectedEp?.slug + selectedServer?.server_name} title={movie.name} selectedEp={selectedEp.name} poster={movie.poster_url} /></div>}
                  {/* Tabs */}
                  <Tabs defaultValue="tapphim" className="mb-6 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-secondary/50 border border-border rounded-lg p-1">
                      <TabsTrigger value="tapphim" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tập phim</TabsTrigger>
                      <TabsTrigger value="gallery" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Gallery</TabsTrigger>
                      <TabsTrigger value="chitiet" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Chi tiết</TabsTrigger>
                      <TabsTrigger value="soundtrack" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Soundtrack</TabsTrigger>
                      <TabsTrigger value="giaisuat" className="text-xs rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Giải suất</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tapphim" className="mt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex gap-2 ">{movie.episodes.map(item =>
                          <Button
                            size="sm"
                            key={item.server_name}
                            onClick={() => setSelectedServer(item)}
                            variant={selectedServer?.server_name === item.server_name ? "default" : "secondary"}
                          >
                            {item.server_name}
                          </Button>
                        )}
                        </span>
                        {/* <span className="text-xs text-muted-foreground ml-auto">Sắp xếp</span> */}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedServer?.server_data.map((item) => {
                          if (!item.slug) return null;
                          return (
                            <button
                              key={item.name}
                              onClick={() => handleSelectEp(item)}
                              className={`flex items-center justify-center gap-1 p-2.5 rounded text-xs font-medium transition-colors ${selectedEp?.slug === item.slug
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-muted"
                                }`}
                            >
                              <Play className="w-2.5 h-2.5" />
                              Tập {item.slug}
                            </button>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="chitiet" className="mt-4 space-y-3">
                      <DetailRow label="Giới thiệu" value={movie.content} isHtml={true} />
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-4">
                      <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
                    </TabsContent>
                    <TabsContent value="soundtrack" className="mt-4">
                      <p className="text-sm text-muted-foreground">Chưa có soundtrack</p>
                    </TabsContent>
                    <TabsContent value="giaisuat" className="mt-4">
                      <p className="text-sm text-muted-foreground">Chưa có thông tin giải suất</p>
                    </TabsContent>
                  </Tabs>

                  {/* Info section */}
                  <div className="mb-8 space-y-2 text-sm">
                    <DetailRow label="Thể loại" value={movie.category.map(item => item.name).join(', ')} />
                    <DetailRow
                      label="Quốc gia"
                      value={movie.country.map(item => item.name).join(", ")}
                    />
                    {/* <DetailRow label="Diễn viên" value={peoples.map((item) =>
                      item.name)} /> */}
                  </div>

                  {/* Cast */}
                  <Cast loading={castLoading} peoples={peoples} profile_sizes={profile_sizes} />
                  {/* Comments */}
                  <div className="mb-8 hidden md:block">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-base font-semibold text-foreground">💬 Bình luận ({sampleComments.length * 8})</h3>
                      <Button variant="default" size="sm" className="text-xs rounded-full">Tốt nhất</Button>
                      <Button variant="ghost" size="sm" className="text-xs rounded-full text-muted-foreground">Gần gần</Button>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Viết bình luận..."
                          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary/50 transition-colors min-h-[60px]"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Tìm kiếm</span>
                          <span className="text-xs text-muted-foreground">🖼 GIF</span>
                          <Button size="sm" className="ml-auto rounded-full text-xs px-4">Gửi</Button>
                        </div>
                      </div>
                    </div>

                    <Comment sampleComments={sampleComments} />
                  </div>
                </div>

                {/* Sidebar - Top phim tuần này */}
                <aside className="lg:w-[300px] flex-shrink-0 hidden md:block">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    🔥 Top phim tuần này (này chưa làm)
                  </h3>
                  <div className="space-y-3">
                    {topMovies.concat(featuredMovies.slice(0, 5)).map((m, i) => (
                      <div key={`${m.id}-${i}`} className="flex items-center gap-3 group cursor-pointer">
                        <span
                          className={`text-lg font-black w-6 text-center flex-shrink-0 ${i < 3 ? "text-primary" : "text-muted-foreground"
                            }`}
                        >
                          {i + 1}
                        </span>
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-12 h-16 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {m.year} · {m.country}
                          </p>
                          {m.episodes && (
                            <p className="text-[10px] text-muted-foreground">{m.episodes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </>
      }
    </>
  );
}

function DetailRow({ label, value, isHtml = false }: { label: string; value: string[] | string, isHtml?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">{label}:</span>
      {isHtml ? <span dangerouslySetInnerHTML={{ __html: value }} className="text-foreground/90" /> :
        <span className="text-foreground/90">{value}</span>
      }
    </div>
  );
}
