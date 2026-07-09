"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  History,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Zap,
  Lightbulb,
  Bug,
  Film,
  Send,
  RefreshCw,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Menu,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/useAuthStore";
import { adminApi } from "@/lib/api/admin/adminApi";
import { feedbackApi } from "@/lib/api/feedback/feedbackApi";
import {
  WatchHistoryItem,
  PaginationInfo,
} from "@/lib/api/admin/adminInterface";
import {
  Feedback,
  FeedbackStats,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUS,
  FeedbackCategory,
  FeedbackStatus,
} from "@/lib/api/feedback/feedbackInterface";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminQueryComments,
  useAdminQueryStats,
} from "@/lib/api/admin/adminQuery";
import useQueryResult from "@/hooks/useQueryResult";
import AdminUsers from "@/components/features/Admin/users/Users";
import { cn } from "@/lib/utils";

type TabValue =
  | "dashboard"
  | "users"
  | "watch-history"
  | "comments"
  | "feedback";

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
    id: "feedback",
    label: "Phản hồi",
    description: "Hỗ trợ người dùng",
    icon: Inbox,
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

  if (loading) {
    return <AdminLoadingSkeleton />;
  }

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

          <div className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <AdminPageIntro
              title={activeNav.label}
              description={activeNav.description}
            />

            {activeTab === "dashboard" && (
              <DashboardContent onNavigate={handleTabChange} />
            )}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "watch-history" && <WatchHistoryContent />}
            {activeTab === "comments" && <CommentsContent />}
            {activeTab === "feedback" && <FeedbackContent />}
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

function AdminSectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={title || action ? "pt-0" : "p-0"}>
        {children}
      </CardContent>
    </Card>
  );
}

function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

function AdminPagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
      <p className="text-sm text-muted-foreground">
        Trang {pagination.page} / {pagination.totalPages}
        <span className="hidden sm:inline">
          {" "}
          · {pagination.total.toLocaleString()} mục
        </span>
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============

function DashboardContent({
  onNavigate,
}: {
  onNavigate: (tab: TabValue) => void;
}) {
  const token = useAuthStore.getState().tokens?.accessToken;
  const { data, isLoading } = useAdminQueryStats(token);

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

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = "primary",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  accent?: "primary" | "emerald" | "sky" | "amber";
}) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
              {value.toLocaleString()}
            </p>
            {trend !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium mt-2",
                  trend >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500",
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {trend >= 0 ? "+" : ""}
                {trend}% {trendLabel}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              accentStyles[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ WATCH HISTORY ============

function WatchHistoryContent() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searched, setSearched] = useState(false);

  const loadHistory = async (page = 1) => {
    if (!selectedUserId.trim()) return;
    setLoading(true);
    setSearched(true);
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      const result = await adminApi.getUserWatchHistory(
        selectedUserId.trim(),
        token,
        { page },
      );
      if (result.success) {
        setHistory(result.data);
        setPagination(result.pagination);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <AdminSectionCard
        title="Tra cứu lịch sử xem"
        description="Nhập User ID để xem danh sách phim đã xem"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Nhập User ID..."
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadHistory(1)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => loadHistory(1)}
            disabled={!selectedUserId.trim()}
            className="shrink-0"
          >
            <Search className="size-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
      </AdminSectionCard>

      {searched && (
        <AdminSectionCard className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <AdminEmptyState
              icon={History}
              title="Không có lịch sử xem"
              description="User này chưa xem phim nào hoặc ID không hợp lệ"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phim</TableHead>
                    <TableHead className="hidden md:table-cell">Tập</TableHead>
                    <TableHead>Tiến độ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Ngày xem
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => {
                    const progressPct =
                      item.duration > 0
                        ? Math.round((item.progress / item.duration) * 100)
                        : 0;
                    return (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.moviePoster && (
                              <img
                                src={`https://img.ophim.live/uploads/movies/${item.moviePoster}`}
                                alt=""
                                className="size-10 rounded object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm line-clamp-2">
                                {item.movieTitle}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.year} · {item.quality}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {item.currentEpName || item.currentEpSlug || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="w-24 space-y-1">
                            <Progress value={progressPct} className="h-1.5" />
                            <span className="text-xs text-muted-foreground">
                              {progressPct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.deletedAt ? (
                            <Badge variant="destructive" className="text-xs">
                              Đã xóa
                            </Badge>
                          ) : item.completed ? (
                            <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15">
                              Hoàn thành
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Đang xem
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {pagination && (
                <AdminPagination
                  pagination={pagination}
                  onPageChange={loadHistory}
                />
              )}
            </>
          )}
        </AdminSectionCard>
      )}

      {!searched && (
        <AdminEmptyState
          icon={Search}
          title="Nhập User ID để bắt đầu"
          description="Tra cứu lịch sử xem phim của từng người dùng"
        />
      )}
    </div>
  );
}

// ============ COMMENTS ============

function CommentsContent() {
  const { queryResult, searchValue, setSearch, setPage } = useQueryResult();
  const token = useAuthStore.getState().tokens?.accessToken;
  const { data, isLoading, refetch } = useAdminQueryComments(
    token,
    queryResult,
  );

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      await adminApi.deleteComment(commentId, token);
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bình luận..."
          value={searchValue}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <AdminSectionCard className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="Không có bình luận nào"
            description="Danh sách bình luận trống hoặc không khớp tìm kiếm"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead className="hidden md:table-cell">Phim</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead className="hidden sm:table-cell">Ngày</TableHead>
                  <TableHead className="text-right w-16">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarImage src={comment.userId?.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {comment.userId?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">
                          {comment.userId?.name || "Ẩn danh"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link
                        href={`/phim/${comment.movieSlug}`}
                        className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
                      >
                        <span className="truncate max-w-[160px]">
                          {comment.movieTitle || comment.movieSlug}
                        </span>
                        <ExternalLink className="size-3 shrink-0 opacity-50" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-md">
                        {comment.text}
                      </p>
                      <p className="md:hidden text-xs text-muted-foreground mt-1 truncate">
                        {comment.movieTitle || comment.movieSlug}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(comment._id)}
                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data?.pagination && (
              <AdminPagination
                pagination={data.pagination}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </AdminSectionCard>
    </div>
  );
}

// ============ FEEDBACK ============

function FeedbackContent() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<
    FeedbackCategory | "all"
  >("all");

  const loadFeedback = useCallback(
    async (page = 1) => {
      setLoading(true);
      const token = useAuthStore.getState().tokens?.accessToken;
      if (token) {
        const result = await feedbackApi.getList(token, {
          page,
          status: filterStatus !== "all" ? filterStatus : undefined,
          category: filterCategory !== "all" ? filterCategory : undefined,
        });
        if (result.success) {
          setFeedbackList(result.data);
          setPagination(result.pagination);
        }
      }
      setLoading(false);
    },
    [filterStatus, filterCategory],
  );

  const loadStats = useCallback(async () => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      const result = await feedbackApi.getStats(token);
      if (result.success && result.data) {
        setStats(result.data);
      }
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleReply = async (
    feedbackId: string,
    status: FeedbackStatus,
    reply: string,
  ) => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      await feedbackApi.reply(feedbackId, token, { status, adminReply: reply });
      loadFeedback(pagination?.page);
      loadStats();
      setSelectedFeedback(null);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      await feedbackApi.delete(feedbackId, token);
      loadFeedback(pagination?.page);
      loadStats();
    }
  };

  const getCategoryIcon = (category: FeedbackCategory) => {
    switch (category) {
      case "bug_report":
        return Bug;
      case "feature_request":
        return Lightbulb;
      case "improvement":
        return Zap;
      case "content_request":
        return Film;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Tổng" value={stats?.total || 0} icon={FileText} />
        <StatCard
          title="Chờ xử lý"
          value={stats?.pending || 0}
          icon={AlertTriangle}
          accent="amber"
        />
        <StatCard
          title="Đang xử lý"
          value={stats?.inProgress || 0}
          icon={RefreshCw}
          accent="sky"
        />
        <StatCard
          title="Đã xử lý"
          value={stats?.resolved || 0}
          icon={CheckCircle}
          accent="emerald"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as FeedbackStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="in_progress">Đang xử lý</SelectItem>
            <SelectItem value="resolved">Đã xử lý</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterCategory}
          onValueChange={(v) =>
            setFilterCategory(v as FeedbackCategory | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="bug_report">Báo lỗi</SelectItem>
            <SelectItem value="feature_request">Đề xuất tính năng</SelectItem>
            <SelectItem value="improvement">Cải thiện</SelectItem>
            <SelectItem value="content_request">Yêu cầu thêm phim</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : feedbackList.length === 0 ? (
        <AdminSectionCard>
          <AdminEmptyState
            icon={Inbox}
            title="Không có phản hồi nào"
            description="Thử đổi bộ lọc hoặc quay lại sau"
          />
        </AdminSectionCard>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((fb) => {
            const CategoryIcon = getCategoryIcon(fb.category);
            return (
              <Card
                key={fb._id}
                className="overflow-hidden transition-colors hover:border-primary/30"
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <CategoryIcon className="size-3" />
                          {FEEDBACK_CATEGORIES[fb.category]?.label ||
                            fb.category}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            FEEDBACK_STATUS[fb.status]?.color,
                          )}
                        >
                          {FEEDBACK_STATUS[fb.status]?.label}
                        </Badge>
                        {fb.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            Ưu tiên cao
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-medium leading-snug">{fb.subject}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {fb.content}
                      </p>

                      {fb.adminReply && (
                        <div className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2">
                          <p className="text-xs font-medium text-primary mb-0.5">
                            Phản hồi Admin
                          </p>
                          <p className="text-sm">{fb.adminReply}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {fb.userId
                            ? fb.userId.name || fb.userId.email
                            : fb.email || "Ẩn danh"}
                        </span>
                        <span>
                          {new Date(fb.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setSelectedFeedback(fb)}
                      >
                        <Send className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(fb._id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Card className="overflow-hidden">
          <AdminPagination
            pagination={pagination}
            onPageChange={loadFeedback}
          />
        </Card>
      )}

      <FeedbackReplyDialog
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onReply={handleReply}
      />
    </div>
  );
}

function FeedbackReplyDialog({
  feedback,
  onClose,
  onReply,
}: {
  feedback: Feedback | null;
  onClose: () => void;
  onReply: (feedbackId: string, status: FeedbackStatus, reply: string) => void;
}) {
  const [status, setStatus] = useState<FeedbackStatus>("pending");
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (feedback) {
      setStatus(
        feedback.status === "pending" ? "in_progress" : feedback.status,
      );
      setReply("");
    }
  }, [feedback]);

  if (!feedback) return null;

  return (
    <Dialog open={!!feedback} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Phản hồi người dùng</DialogTitle>
          <DialogDescription className="line-clamp-1">
            {feedback.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Nội dung gốc</p>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              {feedback.content}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Cập nhật trạng thái</p>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as FeedbackStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã xử lý</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Phản hồi của bạn</p>
            <Textarea
              placeholder="Viết phản hồi cho người dùng..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={() => onReply(feedback._id, status, reply)}>
            <Send className="size-4 mr-2" />
            Gửi phản hồi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
