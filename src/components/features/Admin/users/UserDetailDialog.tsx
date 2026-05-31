import { Button } from "@/components/ui/button";
import { AdminUser } from "@/lib/api/admin/adminInterface";
import { useAuthStore, WatchHistoryItem } from "@/stores";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  History,
  Shield,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import InfoCard from "./InfoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminQueryWatchHistory } from "@/lib/api/admin/adminQuery";
import useQueryResult from "@/hooks/useQueryResult";
import { getImageSrc } from "@/services/uploadFile";
export const  UserDetailDialog =({
  user,
  onClose,
  onUpdateRole,
  onToggleStatus,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onUpdateRole: (userId: string, role: "user" | "admin") => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

    const {queryResult, setPage} = useQueryResult()
      const { data: historyData, isLoading ,refetch} = useAdminQueryWatchHistory(
        useAuthStore.getState().tokens?.accessToken || "",
        user?._id || "",
        queryResult,
      );
  useEffect(() => {
    if (user) { 
      setActiveTab("info");
      setHistory([]);
    }
  }, [user?._id]);


  const handleTabChange = (tab: "info" | "history") => {
    setActiveTab(tab);
    if (tab === "history" && history.length === 0) {
      refetch();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl min-h-screen max-h-dvh overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </div>
        </DialogHeader>

        {/* User Header */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-2xl">
                {user.name?.[0] || user.email[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {user.name || "Chưa đặt tên"}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" /> Admin
                  </>
                ) : (
                  "User"
                )}
              </Badge>
              <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? "Hoạt động" : "Bị khóa"}
              </Badge>
              <Badge variant="outline">
                {user.provider === "google" ? "Google" : "Email"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b mt-4">
          <button
            onClick={() => handleTabChange("info")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => handleTabChange("history")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Lịch sử xem
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mt-4">
          {activeTab === "info" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="ID" value={user._id} copyable />
                <InfoCard label="Email" value={user.email} copyable />
                <InfoCard label="Tên" value={user.name || "Chưa đặt tên"} />
                <InfoCard label="Username" value={user.username || "Chưa có"} />
                <InfoCard
                  label="Provider"
                  value={user.provider === "google" ? "Google" : "Email"}
                />
                <InfoCard label="Vai trò" value={user.role} />
                <InfoCard
                  label="Trạng thái"
                  value={user.isActive ? "Hoạt động" : "Bị khóa"}
                />
                <InfoCard
                  label="Ngày tạo"
                  value={new Date(user.createdAt).toLocaleString("vi-VN")}
                />
                <InfoCard
                  label="Cập nhật lần cuối"
                  value={new Date(user.updatedAt).toLocaleString("vi-VN")}
                />
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Thao tác quản trị</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Thay đổi vai trò</p>
                      <p className="text-xs text-muted-foreground">
                        Cấp quyền Admin để truy cập trang quản trị
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={user.role === "admin" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onUpdateRole(user._id, "admin")}
                        disabled={user.role === "admin"}
                      >
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        Admin
                      </Button>
                      <Button
                        variant={user.role === "user" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onUpdateRole(user._id, "user")}
                        disabled={user.role === "user"}
                      >
                        User
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Khóa tài khoản</p>
                      <p className="text-xs text-muted-foreground">
                        Khóa tài khoản để ngăn người dùng đăng nhập
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={user.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => onToggleStatus(user._id, true)}
                        disabled={user.isActive}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Kích hoạt
                      </Button>
                      <Button
                        variant={!user.isActive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => onToggleStatus(user._id, false)}
                        disabled={!user.isActive}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Khóa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">User ID:</span>{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {user._id}
                  </code>
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : historyData.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Người dùng chưa xem phim nào</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {historyData?.data?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        {item.moviePoster && (
                          <img
                            src={getImageSrc(item.moviePoster, item.source)}
                            alt={item.movieTitle || "Không có tiêu đề"}
                            className="w-12 h-16 rounded object-cover flex-shrink-0"
                            loading="lazy"
                            width={48}
                            height={64}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm truncate">
                                {item.movieTitle || "Không có tiêu đề"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.originName && `(${item.originName})`}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {item.deletedAt ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
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
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span>
                              Tập:{" "}
                              {item.currentEpName || item.currentEpSlug || "-"}
                            </span>
                            <span>Nguồn: {item.source || "-"}</span>
                            <span>
                              Tiến độ:{" "}
                              {Math.round(
                                (item.progress / item.duration) * 100,
                              ) || 0}
                              %
                            </span>
                            <span>
                              Thời lượng: {Math.round(item.duration / 60)}p
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${Math.min((item.progress / item.duration) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {item.year && `${item.year}`}
                              {item.quality && ` • ${item.quality}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Xem:{" "}
                              {new Date(
                                item.watchedAt || item.createdAt,
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>

                          {/* Deleted info */}
                          {item.deletedAt && (
                            <p className="text-xs text-red-500 mt-1">
                              Đã xóa lúc:{" "}
                              {new Date(item.deletedAt).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History Pagination */}
                  {historyData?.pagination && historyData?.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyData?.pagination?.page <= 1}
                        onClick={() => setPage(historyData?.pagination?.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Trang {historyData?.pagination?.page} /{" "}
                        {historyData?.pagination?.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          historyData?.pagination?.page >= historyData?.pagination?.totalPages
                        }
                        onClick={() => setPage(historyData?.pagination?.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
