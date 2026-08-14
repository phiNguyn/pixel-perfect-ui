import { PaginationInfo } from "@/lib/api/admin/adminInterface";
import { feedbackApi } from "@/lib/api/feedback/feedbackApi";
import {
  Feedback,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUS,
  FeedbackCategory,
  FeedbackStats,
  FeedbackStatus,
} from "@/lib/api/feedback/feedbackInterface";
import { useAuthStore } from "@/stores";
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  FileText,
  Film,
  Inbox,
  Lightbulb,
  RefreshCw,
  Send,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import StatCard from "./Card/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSectionCard, {
  AdminEmptyState,
  AdminPagination,
} from "./Card/AdminSectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackContent() {
  const token = useAuthStore((state) => state.tokens?.accessToken);
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
      if (!token) return;
      setLoading(true);
      const result = await feedbackApi.getList(token, {
        page,
        status: filterStatus !== "all" ? filterStatus : undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
      });
      if (result.success) {
        setFeedbackList(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    },
    [token, filterStatus, filterCategory],
  );

  const loadStats = useCallback(async () => {
    if (!token) return;
    const result = await feedbackApi.getStats(token);
    if (result.success && result.data) {
      setStats(result.data);
    }
  }, [token]);

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
    if (!token) return;
    await feedbackApi.reply(feedbackId, token, { status, adminReply: reply });
    loadFeedback(pagination?.page);
    loadStats();
    setSelectedFeedback(null);
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    if (!token) return;
    await feedbackApi.delete(feedbackId, token);
    loadFeedback(pagination?.page);
    loadStats();
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

export function FeedbackReplyDialog({
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
