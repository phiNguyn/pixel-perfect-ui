// ============ COMMENTS ============

import { Input } from "@/components/ui/input";
import useQueryResult from "@/hooks/useQueryResult";
import { adminApi } from "@/lib/api/admin/adminApi";
import { useAdminQueryComments } from "@/lib/api/admin/adminQuery";
import { useAuthStore } from "@/stores";
import { ExternalLink, MessageSquare, Search, Trash2 } from "lucide-react";
import AdminSectionCard, {
  AdminEmptyState,
  AdminPagination,
} from "../Card/AdminSectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CommentContent() {
  const { queryResult, searchValue, setSearch, setPage } = useQueryResult();
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const { data, isLoading, refetch } = useAdminQueryComments(
    token || "",
    queryResult,
  );

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    const currentToken = useAuthStore.getState().tokens?.accessToken;
    if (currentToken) {
      await adminApi.deleteComment(commentId, currentToken);
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
