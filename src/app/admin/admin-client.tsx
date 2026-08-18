"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Users,
  MessageSquare,
  History,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Film,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Menu,
  Inbox,
  CalendarCheck,
  TrendingUp,
  PieChart as PieChartIcon,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/useAuthStore";
import { adminApi } from "@/lib/api/admin/adminApi";
import { PaginationInfo, TodayCheckIn } from "@/lib/api/admin/adminInterface";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminQueryStats } from "@/lib/api/admin/adminQuery";
import { cn } from "@/lib/utils";
import AdminSectionCard, {
  AdminEmptyState,
  AdminPagination,
} from "@/components/features/Admin/Card/AdminSectionCard";
import WatchHistoryContent from "@/components/features/Admin/WatchHistoriesContent";
import FeedbackContent from "@/components/features/Admin/FeedbackContent";
import NotificationContent from "@/components/features/Admin/Notification/NotificationContent";
import StatCard from "@/components/features/Admin/Card/StatCard";
import CommentContent from "@/components/features/Admin/Comment/CommentContent";
import {
  StatsAreaChart,
  StatsBarChart,
  StatsPieChart,
} from "@/components/features/Charts/StatsCharts";

// Lazy load AdminUsers - heavy component với nhiều dialogs và tables
const AdminUsers = dynamic(
  () =>
    import("@/components/features/Admin/users/Users").then(
      (mod) => mod.default,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    ),
  },
);

type TabValue =
  | "dashboard"
  | "users"
  | "watch-history"
  | "comments"
  | "feedback"
  | "check-ins"
  | "notifications";

const NAV_ITEMS: {
  id: TabValue;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    description: "Thống kê hệ thống",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Người dùng",
    description: "Quản lý tài khoản",
    icon: Users,
  },
  {
    id: "watch-history",
    label: "Lịch sử xem",
    description: "Theo dõi hoạt động",
    icon: History,
  },
  {
    id: "comments",
    label: "Bình luận",
    description: "Kiểm duyệt nội dung",
    icon: MessageSquare,
  },
  {
    id: "check-ins",
    label: "Check-in",
    description: "Điểm danh hôm nay",
    icon: CalendarCheck,
  },
  {
    id: "feedback",
    label: "Phản hồi",
    description: "Hỗ trợ người dùng",
    icon: Inbox,
  },
  {
    id: "notifications",
    label: "Thông báo",
    description: "Gửi & quản lý thông báo",
    icon: Bell,
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/dang-nhap?redirect=/admin");
    } else if (user?.role !== "admin") {
      setError("Bạn không có quyền truy cập trang này");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    router.replace(`/admin?tab=${tab}`);
  };

  if (error || user?.role !== "admin") {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="size-7 text-yellow-500" />
            </div>
            <CardTitle>Truy cập bị từ chối</CardTitle>
            <CardDescription>
              {error || "Bạn cần quyền Admin để truy cập trang này"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeNav = NAV_ITEMS.find((item) => item.id === activeTab)!;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-muted/20 mt-16">
      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop sidebar */}
        <div className="hidden lg:fixed left-0 lg:flex w-64 shrink-0 flex-col border-r bg-background/80 backdrop-blur-sm  h-[calc(100dvh-4rem)]">
          <AdminSidebarNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <AdminSidebarFooter user={user} onLogout={logout} />
        </div>
        {/* Mobile nav sheet */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Admin Portal
              </SheetTitle>
            </SheetHeader>
            <AdminSidebarNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              className="flex-1"
            />
            <AdminSidebarFooter user={user} onLogout={logout} />
          </SheetContent>
        </Sheet>
        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="size-4" />
                </Button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Button onClick={router.back} variant="outline">
                      <ArrowLeft className="size-3" />
                      Pinuss Flix
                    </Button>
                    <span>/</span>
                    <span>Admin</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                    {user?.email}
                  </p>
                </div>
                <Avatar className="size-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">
                    {(user?.name?.[0] || user?.email?.[0] || "A").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Mobile tab strip */}
            <div className="lg:hidden border-t w-full overflow-auto">
              <div className="flex gap-1 px-3 py-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 pb-24 md:px-6 py-6">
            <AdminPageIntro
              title={activeNav.label}
              description={activeNav.description}
            />

            {activeTab === "dashboard" && (
              <DashboardContent onNavigate={handleTabChange} />
            )}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "watch-history" && <WatchHistoryContent />}
            {activeTab === "comments" && <CommentContent />}
            {activeTab === "check-ins" && <TodayCheckInsContent />}
            {activeTab === "feedback" && <FeedbackContent />}
            {activeTab === "notifications" && <NotificationContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LAYOUT COMPONENTS ============

function AdminSidebarNav({
  activeTab,
  onTabChange,
  className,
}: {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)}>
      <div className="mb-3 hidden lg:block px-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Quản trị
        </p>
        <p className="text-sm font-semibold mt-0.5">Pinuss Flix</p>
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                isActive ? "bg-primary/15" : "bg-muted",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block leading-none">{item.label}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground truncate">
                {item.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function AdminSidebarFooter({
  user,
  onLogout,
}: {
  user: { name?: string; email?: string; avatar?: string } | null;
  onLogout: () => void;
}) {
  return (
    <div className="mt-auto border-t p-3 space-y-2">
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-2">
        <Avatar className="size-8">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="text-xs">
            {(user?.name?.[0] || "A").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={onLogout}
      >
        <LogOut className="size-4" />
        Đăng xuất
      </Button>
    </div>
  );
}

function AdminPageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 hidden lg:block">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

// ============ DASHBOARD ============

// Mock data for charts - in production, this would come from an API endpoint
function generateMockChartData() {
  // User growth data (last 6 months)
  const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
  const userGrowth = [120, 185, 245, 310, 380, 450];
  const activeUsers = [80, 120, 165, 210, 280, 350];

  return {
    userGrowth: months.map((name, i) => ({
      name,
      "Người dùng mới": userGrowth[i],
      "Người dùng hoạt động": activeUsers[i],
    })),
    activity: [
      { name: "Bình luận", value: 1250, color: "#6366f1" },
      { name: "Lịch sử xem", value: 3420, color: "#8b5cf6" },
      { name: "Check-in", value: 890, color: "#10b981" },
      { name: "Yêu thích", value: 670, color: "#f59e0b" },
    ],
  };
}

function DashboardContent({
  onNavigate,
}: {
  onNavigate: (tab: TabValue) => void;
}) {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const { data, isLoading } = useAdminQueryStats(token || "");
  const chartData = useMemo(() => generateMockChartData(), []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.totalUsersGrowth}
          trendLabel="tháng này"
          accent="primary"
        />
        <StatCard
          title="Người dùng hoạt động"
          value={stats?.activeUsers || 0}
          icon={CheckCircle}
          accent="emerald"
        />
        <StatCard
          title="Tổng bình luận"
          value={stats?.totalComments || 0}
          icon={MessageSquare}
          accent="sky"
        />
        <StatCard
          title="Lượt xem phim"
          value={stats?.totalWatchHistory || 0}
          icon={Film}
          accent="amber"
        />
      </div>

      {/* Charts Section */}
      <AdminSectionCard
        title="Thống kê chi tiết"
        description="Biểu đồ hoạt động của hệ thống"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* User Growth Area Chart */}
          <div className="lg:col-span-2 bg-card/50 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Tăng trưởng người dùng</h3>
            </div>
            <div className="h-56">
              <StatsAreaChart
                data={chartData.userGrowth.map((d) => ({
                  name: d.name,
                  value: d["Người dùng mới"],
                }))}
                color="primary"
                valueFormatter={(v) => `${v} người`}
              />
            </div>
          </div>

          {/* Activity Pie Chart */}
          <div className="bg-card/50 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Phân bố hoạt động</h3>
            </div>
            <div className="h-56">
              <StatsPieChart
                data={chartData.activity}
                valueFormatter={(v) => `${v}`}
                innerRadius={40}
                outerRadius={70}
              />
            </div>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Truy cập nhanh"
        description="Chuyển đến các khu vực quản trị thường dùng"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NAV_ITEMS.filter((item) => item.id !== "dashboard").map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="group flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <Icon className="size-5 text-muted-foreground group-hover:text-primary" />
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </AdminSectionCard>
    </div>
  );
}

// ============ CHECK-INS ============

function TodayCheckInsContent() {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [checkIns, setCheckIns] = useState<TodayCheckIn[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCheckIns = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      const result = await adminApi.getTodayCheckIns(token, { page });
      if (result.success) {
        setCheckIns(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    },
    [token],
  );

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
          🥇 #1
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-slate-400/15 text-slate-500 dark:text-slate-400 border-slate-400/30">
          🥈 #2
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-orange-600/15 text-orange-600 dark:text-orange-400 border-orange-600/30">
          🥉 #3
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        #{rank}
      </Badge>
    );
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <AdminSectionCard
        title="Check-in hôm nay"
        description="Danh sách người dùng đã check-in, xếp theo thời gian sớm nhất"
      >
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : checkIns.length === 0 ? (
          <AdminEmptyState
            icon={CalendarCheck}
            title="Chưa có ai check-in hôm nay"
            description="Danh sách sẽ cập nhật khi có người dùng điểm danh"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hạng</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Thời gian check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn, index) => {
                  const rank =
                    ((pagination?.page || 1) - 1) * (pagination?.limit || 50) +
                    index +
                    1;
                  return (
                    <TableRow key={checkIn._id}>
                      <TableCell>{getRankBadge(rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={checkIn.userId?.avatar} />
                            <AvatarFallback className="text-xs">
                              {checkIn.userId?.name?.[0] ||
                                checkIn.userId?.email?.[0] ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[200px]">
                              {checkIn.userId?.name || "Không tên"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {checkIn.userId?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatTime(checkIn.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {checkIn.date}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pagination && (
              <AdminPagination
                pagination={pagination}
                onPageChange={loadCheckIns}
              />
            )}
          </>
        )}
      </AdminSectionCard>
    </div>
  );
}

// ============ LOADING ============

function AdminLoadingSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-muted/20">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden lg:block w-64 shrink-0 border-r p-3 space-y-2">
          <Skeleton className="h-8 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </aside>
        <div className="flex-1 p-4 md:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
