"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { adminApi } from "@/lib/api/admin/adminApi";
import {
  AdminNotification,
  AdminUser,
  NotificationType,
  PaginationInfo,
} from "@/lib/api/admin/adminInterface";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import AdminSectionCard, {
  AdminEmptyState,
  AdminPagination,
} from "../Card/AdminSectionCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const NOTIFICATION_TYPES: Record<
  NotificationType,
  { label: string; color: string }
> = {
  system: {
    label: "Hệ thống",
    color: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  },
  event: {
    label: "Sự kiện",
    color: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  },
  comment_reply: {
    label: "Trả lời",
    color: "bg-green-500/15 text-green-600 border-green-500/30",
  },
  leaderboard_overtake: {
    label: "Vượt rank",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
  rank_change: {
    label: "Thay đổi rank",
    color: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  },
};

export default function NotificationContent() {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [expandedNotification, setExpandedNotification] = useState<
    string | null
  >(null);

  const loadNotifications = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      const result = await adminApi.getNotifications(token, {
        page,
        type: filterType !== "all" ? filterType : undefined,
      });
      if (result.success) {
        setNotifications(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    },
    [token, filterType],
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadNotifications(pagination?.page);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as NotificationType | "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Loại thông báo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="size-4 mr-2" />
          Tạo thông báo
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <AdminSectionCard>
          <AdminEmptyState
            icon={Bell}
            title="Chưa có thông báo nào"
            description="Tạo thông báo mới bằng cách nhấn nút bên trên"
          />
        </AdminSectionCard>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              isExpanded={expandedNotification === notification._id}
              onToggleExpand={() =>
                setExpandedNotification(
                  expandedNotification === notification._id
                    ? null
                    : notification._id,
                )
              }
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Card className="overflow-hidden">
          <AdminPagination
            pagination={pagination}
            onPageChange={loadNotifications}
          />
        </Card>
      )}

      <CreateNotificationDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

function NotificationCard({
  notification,
  isExpanded,
  onToggleExpand,
}: {
  notification: AdminNotification;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const typeInfo = NOTIFICATION_TYPES[notification.type] || {
    label: notification.type,
    color: "bg-gray-500/15 text-gray-600 border-gray-500/30",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:border-primary/30 cursor-pointer",
        notification.readBy.length > 0 && "border-green-500/20",
      )}
      onClick={onToggleExpand}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="size-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs gap-1", typeInfo.color)}
              >
                {typeInfo.label}
              </Badge>
              {notification.readBy.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-500/30"
                >
                  <Check className="size-3" />
                  {notification.readBy.length}/{notification.recipients.length} đã đọc
                </Badge>
              )}
            </div>

            <h4 className="font-medium leading-snug">{notification.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-3" />
                {notification.recipients.length > 0
                  ? `${notification.recipients.length} người nhận`
                  : notification.userId
                    ? `1 người nhận (cũ)`
                    : "Không xác định"}
              </span>
              <span>
                {new Date(notification.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {notification.link && (
                <span className="text-primary">Có link</span>
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-3">
                {notification.recipients.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Người nhận ({notification.recipients.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {notification.recipients.slice(0, 10).map((recipient) => (
                        <span
                          key={recipient._id}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {recipient.name || recipient.email}
                        </span>
                      ))}
                      {notification.recipients.length > 10 && (
                        <span className="text-xs text-muted-foreground">
                          +{notification.recipients.length - 10} người nữa
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {notification.userId && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Người nhận (notification cũ):
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={notification.userId.avatar} />
                        <AvatarFallback className="text-xs">
                          {(notification.userId.name?.[0] || notification.userId.email[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {notification.userId.name || notification.userId.email}
                      </span>
                    </div>
                  </div>
                )}

                {notification.readBy.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Đã đọc ({notification.readBy.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {notification.readBy.map((reader) => (
                        <div
                          key={reader.userId._id}
                          className="flex items-center gap-2 rounded-full bg-muted px-2.5 py-1"
                        >
                          <Avatar className="size-5">
                            <AvatarImage src={reader.userId.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {(reader.userId.name?.[0] || reader.userId.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {reader.userId.name || reader.userId.email}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reader.readAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {notification.readBy.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Chưa có ai đọc thông báo này
                  </p>
                )}
              </div>
            )}

            <button className="flex items-center gap-1 text-xs text-primary mt-2">
              {isExpanded ? (
                <>
                  <ChevronDown className="size-3" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronRight className="size-3" />
                  Xem chi tiết
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateNotificationDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState<NotificationType>("system");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showUserSelect, setShowUserSelect] = useState(false);

  useEffect(() => {
    if (open && users.length === 0) {
      loadUsers();
    }
  }, [open]);

  useEffect(() => {
    if (selectAll) {
      setSelectedUserIds([]);
    }
  }, [selectAll]);

  const loadUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    const result = await adminApi.getUsers(token, { limit: 100 });
    if (result.success) {
      setUsers(result.data);
    }
    setLoadingUsers(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleUser = (userId: string) => {
    setSelectAll(false);
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);

    const payload: any = {
      type,
      title: title.trim(),
      message: message.trim(),
      link: link.trim() || undefined,
    };

    if (selectAll) {
      payload.userIds = users.map((u) => u._id);
    } else {
      payload.userIds = selectedUserIds;
    }

    const result = await adminApi.createNotification(payload, token);

    if (result.success) {
      setTitle("");
      setMessage("");
      setLink("");
      setSelectedUserIds([]);
      setSelectAll(false);
      onSuccess();
    } else {
      alert(result.message || "Có lỗi xảy ra");
    }

    setSubmitting(false);
  };

  const isValid =
    title.trim() &&
    message.trim() &&
    ((selectAll && users.length > 0) || selectedUserIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo thông báo mới</DialogTitle>
          <DialogDescription>
            Gửi thông báo đến người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Người nhận</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectAll(!selectAll);
                    if (!selectAll) {
                      setSelectedUserIds([]);
                    }
                  }}
                  className="flex-1"
                >
                  <Users className="size-4 mr-2" />
                  Tất cả người dùng ({users.length})
                </Button>
                <Button
                  type="button"
                  variant={showUserSelect ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUserSelect(!showUserSelect)}
                  className="flex-1"
                >
                  <Search className="size-4 mr-2" />
                  Chọn người dùng ({selectedUserIds.length})
                </Button>
              </div>

              {showUserSelect && (
                <div className="border rounded-lg p-3 space-y-2">
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {loadingUsers ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Không tìm thấy người dùng
                      </p>
                    ) : (
                      filteredUsers.map((user) => (
                        <label
                          key={user._id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            selectedUserIds.includes(user._id)
                              ? "bg-primary/10"
                              : "hover:bg-muted",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user._id)}
                            onChange={() => handleToggleUser(user._id)}
                            className="size-4 rounded border-input"
                          />
                          <Avatar className="size-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {(user.name?.[0] || user.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {user.name || "Không tên"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Loại thông báo</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as NotificationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input
              placeholder="Nhập tiêu đề thông báo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nội dung</Label>
            <Textarea
              placeholder="Nhập nội dung thông báo..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Link (tùy chọn)</Label>
            <Input
              placeholder="https://example.com/link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? (
              "Đang gửi..."
            ) : (
              <>
                <Send className="size-4 mr-2" />
                Gửi thông báo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
