import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useQueryResult from "@/hooks/useQueryResult";
import { adminApi } from "@/lib/api/admin/adminApi";
import { useAdminQueryUsers } from "@/lib/api/admin/adminQuery";
import { useAuthStore } from "@/stores";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Shield,
  Users as UsersIcon,
} from "lucide-react";
import { UserDetailDialog } from "./UserDetailDialog";
import { useState } from "react";

const AdminUsers = () => {
  const token = useAuthStore.getState().tokens?.accessToken;
  const { queryResult, searchValue, setSearch, setPage } = useQueryResult();
  const { data, isLoading, refetch } = useAdminQueryUsers(token, queryResult);
  const [user, setSelectedUser] = useState<any | null>(null);

  const handleUpdateRole = async (userId: string, role: "user" | "admin") => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      await adminApi.updateUserRole(userId, role, token);
      refetch();
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      await adminApi.toggleUserStatus(userId, isActive, token);
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchValue}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <CardContent className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
              <UsersIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Không có người dùng nào</p>
            <p className="text-sm text-muted-foreground mt-1">
              Thử đổi từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={user.avatar}
                            className="object-cover"
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {(
                              user.name?.[0] ||
                              user.email?.[0] ||
                              "?"
                            ).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[140px]">
                            {user.name || "Chưa đặt tên"}
                          </p>
                          <p className="md:hidden text-xs text-muted-foreground truncate max-w-[140px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="size-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          "User"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className={
                          user.isActive
                            ? "text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15"
                            : "text-xs"
                        }
                      >
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="gap-1.5"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Chi tiết</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Trang {data.pagination.page} / {data.pagination.totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => setPage(data.pagination.page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      data.pagination.page >= data.pagination.totalPages
                    }
                    onClick={() => setPage(data.pagination.page + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <UserDetailDialog
        user={user}
        onClose={() => setSelectedUser(null)}
        onUpdateRole={handleUpdateRole}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default AdminUsers;
