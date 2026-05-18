"use client";

import { useState, useEffect } from "react";
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
  Eye,
  Trash2,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Zap,
  Lightbulb,
  Bug,
  Film,
  MoreHorizontal,
  X,
  Send,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { adminApi } from "@/lib/api/admin/adminApi";
import { feedbackApi } from "@/lib/api/feedback/feedbackApi";
import {
  AdminUser,
  AdminStats,
  WatchHistoryItem,
  Comment,
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
  useAdminQueryUsers,
} from "@/lib/api/admin/adminQuery";
import useQueryResult from "@/hooks/useQueryResult";
import AdminUsers from "@/components/features/Admin/users/Users";

type TabValue =
  | "dashboard"
  | "users"
  | "watch-history"
  | "comments"
  | "feedback";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, tokens, logout, _hasHydrated } =
    useAuthStore();
  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    // Wait for hydration
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

  if (loading) {
    return <AdminLoadingSkeleton />;
  }

  if (error || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground mb-4">
            {error || "Bạn cần quyền Admin để truy cập trang này"}
          </p>
          <Button onClick={() => router.push("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-2.5 md:px-4 flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">📺 Pinuss</span>
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-2.5 md:px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý người dùng, nội dung và phản hồi
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
          <TabsList className="mb-6 max-w-full overflow-x-auto grid grid-cols-5 md:grid-cols-4 gap-2">
            <TabsTrigger value="dashboard" className="gap-2 shrink-0">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 shrink-0">
              <Users className="w-4 h-4" />
              Người dùng
            </TabsTrigger>
            <TabsTrigger value="watch-history" className="gap-2 shrink-0">
              <History className="w-4 h-4" />
              Lịch sử xem
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2 shrink-0">
              <MessageSquare className="w-4 h-4" />
              Bình luận
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2 shrink-0">
              <FileText className="w-4 h-4" />
              Phản hồi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardContent />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="watch-history">
            <WatchHistoryContent />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsContent />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============ DASHBOARD CONTENT ============

function DashboardContent() {
  const token = useAuthStore.getState().tokens?.accessToken;
  const { data, isLoading } = useAdminQueryStats(token);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={data?.data?.totalUsers || 0}
          icon={Users}
          trend={data?.data?.totalUsersGrowth}
          trendLabel="tháng này"
        />
        <StatCard
          title="Người dùng hoạt động"
          value={data?.data?.activeUsers || 0}
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="Tổng bình luận"
          value={data?.data?.totalComments || 0}
          icon={MessageSquare}
        />
        <StatCard
          title="Lượt xem phim"
          value={data?.data?.totalWatchHistory || 0}
          icon={Film}
          color="text-blue-500"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "text-primary",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
          {trend !== undefined && (
            <p
              className={`text-xs mt-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% {trendLabel}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color} opacity-80`} />
      </div>
    </div>
  );
}

// ============ WATCH HISTORY CONTENT ============

function WatchHistoryContent() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [selectedUserId]);

  const loadHistory = async (page = 1) => {
    if (!selectedUserId) return;
    setLoading(true);
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      const result = await adminApi.getUserWatchHistory(selectedUserId, token, {
        page,
      });
      if (result.success) {
        setHistory(result.data);
        setPagination(result.pagination);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Nhập User ID để xem lịch sử..."
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
          />
        </div>
        <Button onClick={() => loadHistory(1)} disabled={!selectedUserId}>
          <Search className="w-4 h-4 mr-2" />
          Tìm
        </Button>
      </div>

      {selectedUserId && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Phim
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Tập
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Tiến độ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Ngày xem
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Không có lịch sử xem
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.moviePoster && (
                            <img
                              src={`https://img.ophim.live/uploads/movies/${item.moviePoster}`}
                              alt=""
                              className="w-10 h-14 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.movieTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.year} • {item.quality}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.currentEpName || item.currentEpSlug || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {Math.round((item.progress / item.duration) * 100) || 0}
                        %
                      </td>
                      <td className="px-4 py-3">
                        {item.deletedAt ? (
                          <Badge variant="destructive" className="text-xs">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Đã xóa
                          </Badge>
                        ) : item.completed ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Hoàn thành
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Đang xem
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadHistory(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadHistory(pagination.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ COMMENTS CONTENT ============

function CommentsContent() {
  const { queryResult, searchValue, setSearch ,setPage} = useQueryResult();
  const token = useAuthStore.getState().tokens?.accessToken;
  const { data, isLoading, refetch,  } = useAdminQueryComments(
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
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Người dùng
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Phim</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Nội dung
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Ngày</th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-64" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-8" />
                  </td>
                </tr>
              ))
            ) : data?.data?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Không có bình luận nào
                </td>
              </tr>
            ) : (
              data?.data?.map((comment) => (
                <tr key={comment._id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {comment.userId?.avatar ? (
                        <img
                          src={comment.userId.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                          {comment.userId?.name?.[0] || "?"}
                        </div>
                      )}
                      <span className="text-sm">
                        {comment.userId?.name || "Ẩn danh"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/phim/${comment.movieSlug}`}
                      className="hover:text-primary"
                    >
                      {comment.movieTitle || comment.movieSlug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-md truncate">
                    {comment.text}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data?.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Trang {data?.pagination.page} / {data?.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data?.pagination.page <= 1}
              onClick={() => setPage(data?.pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadComments(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ FEEDBACK CONTENT ============

function FeedbackContent() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | "all">("all");

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [filterStatus, filterCategory]);

  const loadFeedback = async (page = 1) => {
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
  };

  const loadStats = async () => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      const result = await feedbackApi.getStats(token);
      if (result.success && result.data) {
        setStats(result.data);
      }
    }
  };

  const handleReply = async (feedbackId: string, status: FeedbackStatus, reply: string) => {
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
      case "bug_report": return <Bug className="w-4 h-4" />;
      case "feature_request": return <Lightbulb className="w-4 h-4" />;
      case "improvement": return <Zap className="w-4 h-4" />;
      case "content_request": return <Film className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Tổng" value={stats?.total || 0} icon={FileText} />
        <StatCard
          title="Chờ xử lý"
          value={stats?.pending || 0}
          icon={AlertTriangle}
          color="text-yellow-500"
        />
        <StatCard
          title="Đang xử lý"
          value={stats?.inProgress || 0}
          icon={RefreshCw}
          color="text-blue-500"
        />
        <StatCard
          title="Đã xử lý"
          value={stats?.resolved || 0}
          icon={CheckCircle}
          color="text-green-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as FeedbackStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="in_progress">Đang xử lý</SelectItem>
            <SelectItem value="resolved">Đã xử lý</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterCategory}
          onValueChange={(v) => setFilterCategory(v as FeedbackCategory | "all")}
        >
          <SelectTrigger className="w-48">
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

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Không có phản hồi nào
          </div>
        ) : (
          feedbackList.map((fb) => (
            <div
              key={fb._id}
              className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="gap-1">
                      {getCategoryIcon(fb.category)}
                      {FEEDBACK_CATEGORIES[fb.category]?.label || fb.category}
                    </Badge>
                    <Badge className={FEEDBACK_STATUS[fb.status]?.color}>
                      {FEEDBACK_STATUS[fb.status]?.label}
                    </Badge>
                    {fb.priority === "high" && (
                      <Badge variant="destructive"> Cao</Badge>
                    )}
                  </div>
                  <h4 className="font-medium mb-1">{fb.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fb.content}
                  </p>
                  {fb.adminReply && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/10 border-l-4 border-primary">
                      <p className="text-xs font-medium mb-1">Phản hồi của Admin:</p>
                      <p className="text-sm">{fb.adminReply}</p>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {fb.userId ? (
                      <span>{fb.userId.name || fb.userId.email}</span>
                    ) : fb.email ? (
                      <span>{fb.email}</span>
                    ) : (
                      <span>Ẩn danh</span>
                    )}
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFeedback(fb)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(fb._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => loadFeedback(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadFeedback(pagination.page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Reply Dialog */}
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
      setStatus(feedback.status === "pending" ? "in_progress" : feedback.status);
      setReply("");
    }
  }, [feedback]);

  if (!feedback) return null;

  return (
    <Dialog open={!!feedback} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Phản hồi: {feedback.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Nội dung:</p>
            <p className="p-3 rounded-lg bg-muted">{feedback.content}</p>
          </div>

          <div>
            <p className="text-sm mb-2">Cập nhật trạng thái:</p>
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

          <div>
            <p className="text-sm mb-2">Phản hồi của bạn:</p>
            <textarea
              className="w-full p-3 rounded-lg border bg-background min-h-[120px] resize-none"
              placeholder="Viết phản hồi cho người dùng..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={() => onReply(feedback._id, status, reply)}>
            Gửi phản hồi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ LOADING SKELETON ============

function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="px-2.5 md:px-4 h-14 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>
      <main className="px-2.5 md:px-4 py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-12 w-full max-w-md mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </main>
    </div>
  );
}
