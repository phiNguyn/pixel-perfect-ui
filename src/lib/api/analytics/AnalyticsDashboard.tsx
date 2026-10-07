"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { analyticsApi } from "./analyticsApi";
import {
  DashboardSummary,
  UserGrowthResult,
  ViewSourceStats,
  FavoriteStats,
  CommentStats,
  ShareStats,
  TrendingMovie,
  TopMovie,
  TimeRange,
} from "./analyticsInterface";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Users,
  Film,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarCheck,
  AlertCircle,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";

export default function AnalyticsDashboard() {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthResult[]>([]);
  const [viewsBySource, setViewsBySource] = useState<ViewSourceStats[]>([]);
  const [favoriteStats, setFavoriteStats] = useState<FavoriteStats | null>(null);
  const [commentStats, setCommentStats] = useState<CommentStats | null>(null);
  const [shareStats, setShareStats] = useState<ShareStats | null>(null);
  const [trending, setTrending] = useState<TrendingMovie[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);

  useEffect(() => {
    if (!token) return;
    loadAnalytics();
  }, [token, timeRange, dateRange]);

  const loadAnalytics = async () => {
    if (!token) return;
    setLoading(true);

    const apiDateOptions = useCustomRange && dateRange?.from && dateRange?.to ? {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    } : {};

    const [
      dashboardRes,
      growthRes,
      sourceRes,
      favoriteRes,
      commentRes,
      shareRes,
      trendingRes,
      topMoviesRes,
    ] = await Promise.all([
      analyticsApi.getDashboard(token),
      analyticsApi.getUserGrowth(token, { range: useCustomRange ? "all" : timeRange, ...apiDateOptions }),
      analyticsApi.getViewsBySource(token, useCustomRange ? "all" : timeRange),
      analyticsApi.getFavoriteStats(token, useCustomRange ? "all" : timeRange),
      analyticsApi.getCommentStats(token, useCustomRange ? "all" : timeRange),
      analyticsApi.getShareStats(token, useCustomRange ? "all" : timeRange),
      analyticsApi.getTrendingMovies(token, { range: useCustomRange ? "all" : timeRange, limit: 10, ...apiDateOptions }),
      analyticsApi.getTopMovies(token, { range: useCustomRange ? "all" : timeRange, limit: 5, ...apiDateOptions }),
    ]);

    if (dashboardRes.success) setDashboard(dashboardRes.data);
    if (growthRes.success) setUserGrowth(growthRes.data || []);
    if (sourceRes.success) setViewsBySource(sourceRes.data || []);
    if (favoriteRes.success) setFavoriteStats(favoriteRes.data || null);
    if (commentRes.success) setCommentStats(commentRes.data || null);
    if (shareRes.success) setShareStats(shareRes.data || null);
    if (trendingRes.success) setTrending(trendingRes.data || []);
    if (topMoviesRes.success) setTopMovies(topMoviesRes.data || []);

    setLoading(false);
  };

  const handlePresetChange = (value: TimeRange) => {
    setTimeRange(value);
    setUseCustomRange(false);
    setDateRange(undefined);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setUseCustomRange(true);
    }
  };

  const sourceChartData = useMemo(() => {
    return viewsBySource.map((s) => ({
      name: s.source.toUpperCase(),
      value: s.views,
      color: s.source === "ophim" ? "#6366f1" : s.source === "phimapi" ? "#8b5cf6" : "#10b981",
    }));
  }, [viewsBySource]);

  const userGrowthChartData = useMemo(() => {
    return userGrowth.slice(-30).map((g) => ({
      name: g.date.slice(5),
      value: g.newUsers,
    }));
  }, [userGrowth]);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Phân tích nâng cao</h2>
            <p className="text-sm text-muted-foreground mt-1">Thống kê chi tiết về hoạt động của hệ thống</p>
          </div>
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Phân tích nâng cao</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {useCustomRange && dateRange?.from && dateRange?.to
              ? `Dữ liệu từ ${format(dateRange.from, "dd/MM/yyyy", { locale: vi })} đến ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
              : `Dữ liệu ${timeRange === "24h" ? "24 giờ qua" : timeRange === "7d" ? "7 ngày qua" : timeRange === "30d" ? "30 ngày qua" : "90 ngày qua"}`
            }
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Range Selector */}
          <Select value={timeRange} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 giờ</SelectItem>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            date={dateRange}
            onDateChange={handleDateRangeChange}
            placeholder="Tùy chỉnh..."
          />

          {useCustomRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUseCustomRange(false);
                setDateRange(undefined);
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Tổng người dùng" value={dashboard?.users.total || 0} icon={Users} subtitle={`+${dashboard?.users.newToday || 0} hôm nay`} color="primary" />
        <SummaryCard title="Lượt xem" value={dashboard?.views.thisMonth || 0} icon={Film} subtitle={`${dashboard?.views.thisWeek || 0} tuần này`} color="sky" />
        <SummaryCard title="Tổng yêu thích" value={favoriteStats?.totalFavorites || 0} icon={Heart} subtitle={`${favoriteStats?.byType.single || 0} phim lẻ, ${favoriteStats?.byType.series || 0} phim bộ`} color="rose" />
        <SummaryCard title="Tổng bình luận" value={commentStats?.totalComments || 0} icon={MessageSquare} subtitle={`${commentStats?.repliesCount || 0} replies`} color="violet" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tăng trưởng người dùng
            </CardTitle>
            <CardDescription>Biểu đồ người dùng mới theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {userGrowthChartData.length > 0 ? (
                <div className="text-sm text-muted-foreground">[User Growth Chart]</div>
              ) : (
                <p className="text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Views by Source Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Nguồn lượt xem
            </CardTitle>
            <CardDescription>Phân bổ theo nguồn dữ liệu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {sourceChartData.length > 0 ? (
                <div className="text-sm text-muted-foreground">[Pie Chart]</div>
              ) : (
                <p className="text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Movies Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              Top phim xem nhiều nhất
            </CardTitle>
            <CardDescription>Danh sách phim có lượt xem cao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-auto">
              {topMovies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
              ) : (
                topMovies.map((movie, i) => (
                  <div key={movie.movieId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{movie.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">{movie.views.toLocaleString()} lượt xem</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trending Movies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Phim thịnh hành
            </CardTitle>
            <CardDescription>Top phim có lượt xem cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {trending.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
              ) : (
                trending.map((movie, i) => (
                  <div key={movie.movieId} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{movie.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">{movie.views.toLocaleString()} lượt xem</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(movie.trend)}
                      <span className={cn(
                        "text-xs font-medium",
                        movie.trend === "up" && "text-emerald-500",
                        movie.trend === "down" && "text-red-500",
                        movie.trend === "stable" && "text-muted-foreground"
                      )}>
                        {movie.changePercent > 0 ? "+" : ""}{movie.changePercent}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PlatformHealthCard title="Check-in hôm nay" value={dashboard?.engagement.todayCheckIns || 0} icon={CalendarCheck} status="success" />
        <PlatformHealthCard title="Phản hồi chờ xử lý" value={dashboard?.engagement.pendingFeedback || 0} icon={AlertCircle} status={dashboard?.engagement.pendingFeedback ? "warning" : "success"} />
        <PlatformHealthCard title="Thời gian xem hôm nay" value={dashboard?.engagement.totalWatchTimeSeconds || 0} icon={Clock} status="info" formatter={(v) => `${Math.floor(v / 3600)}h ${Math.floor((v % 3600) / 60)}m`} />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  subtitle?: string;
  color?: "primary" | "sky" | "rose" | "violet";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    sky: "bg-sky-500/10 text-sky-500",
    rose: "bg-rose-500/10 text-rose-500",
    violet: "bg-violet-500/10 text-violet-500",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn("p-2 rounded-lg", colorClasses[color || "primary"])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformHealthCard({
  title,
  value,
  icon: Icon,
  status,
  formatter,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  status: "success" | "warning" | "info";
  formatter?: (v: number) => string;
}) {
  const statusConfig = {
    success: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
    warning: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
    info: { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
  };

  const config = statusConfig[status];

  return (
    <Card className={cn("border", config.border)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", config.bg)}>
          <Icon className={cn("h-5 w-5", config.text)} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-xl font-bold", config.text)}>
            {formatter ? formatter(value) : value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
