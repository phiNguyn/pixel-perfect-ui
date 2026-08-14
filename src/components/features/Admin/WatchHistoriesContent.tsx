import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin/adminApi";
import {
  PaginationInfo,
  WatchHistoryItem,
} from "@/lib/api/admin/adminInterface";
import { useAuthStore } from "@/stores";
import { History, Search } from "lucide-react";
import { useState } from "react";
import AdminSectionCard, {
  AdminEmptyState,
  AdminPagination,
} from "./Card/AdminSectionCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function WatchHistoryContent() {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searched, setSearched] = useState(false);

  const loadHistory = async (page = 1) => {
    if (!selectedUserId.trim() || !token) return;
    setLoading(true);
    setSearched(true);
    const result = await adminApi.getUserWatchHistory(
      selectedUserId.trim(),
      token,
      { page },
    );
    if (result.success) {
      setHistory(result.data);
      setPagination(result.pagination);
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
