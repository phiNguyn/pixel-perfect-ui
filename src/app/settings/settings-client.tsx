"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { THEMES, Theme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import {
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  LogIn,
  Moon,
  Save,
  Check,
  Pencil,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { authApi } from "@/lib/api/auth/authApi";

export default function SettingsClient() {
  const { user, isAuthenticated, logout, openLoginModal, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<"name" | "username" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      setSelectedTheme(theme);
    }
  }, [mounted, theme]);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    setTheme(themeId);
    toast.success("Đã cập nhật giao diện!");
  };

  const handleSaveNotifications = () => {
    toast.success("Đã lưu cài đặt thông báo!");
  };

  const openEditDialog = (field: "name" | "username") => {
    setEditingField(field);
    setEditValue(field === "name" ? (user?.name || "") : (user?.username || ""));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingField || !editValue.trim()) {
      toast.error("Vui lòng nhập giá trị hợp lệ");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = editingField === "name"
        ? { name: editValue.trim() }
        : { username: editValue.trim() };

      const updatedUser = await authApi.updateProfile(updateData);

      updateUser({
        name: updatedUser.name,
        username: updatedUser.username,
      });

      toast.success(`Đã cập nhật ${editingField === "name" ? "họ tên" : "tên người dùng"}!`);
      setEditDialogOpen(false);
      setEditingField(null);
      setEditValue("");
    } catch (error: any) {
      const message = error.response?.data?.details?.[0]?.message
        || error.response?.data?.message
        || "Đã xảy ra lỗi";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Cài đặt
        </h1>
        <p className="text-muted-foreground text-sm">
          Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start mb-6 h-auto p-0 bg-transparent gap-1 flex-wrap">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
          >
            <User className="w-4 h-4 mr-2" />
            Tài khoản
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
          >
            <Palette className="w-4 h-4 mr-2" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
          >
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
          >
            <Shield className="w-4 h-4 mr-2" />
            Quyền riêng tư
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {isAuthenticated ? (
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user?.name || "Người dùng"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    <Check className="w-3 h-3" />
                    Đã xác minh
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Họ và tên</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.name || "Chưa cập nhật"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog("name")}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Tên người dùng</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.username ? `@${user.username}` : "Chưa cập nhật"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog("username")}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Phương thức đăng nhập</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user?.provider || "Email"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border/50 p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Đăng nhập để quản lý tài khoản
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Đăng nhập để đồng bộ lịch sử xem và nhận nhiều tính năng hơn
                </p>
              </div>
              <Button onClick={openLoginModal} className="mx-auto">
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Màu chủ đề
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Chọn màu chủ đề phù hợp với phong cách của bạn
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {THEMES.map((t: Theme) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-muted/30 hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center border border-border/50"
                      style={{
                        backgroundColor: t.color,
                        boxShadow: `0 0 12px ${t.color}40`,
                      }}
                    />
                    <p className="text-xs font-medium text-foreground text-center">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                      {t.description}
                    </p>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Chế độ hiển thị
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Chế độ tối</p>
                <p className="text-sm text-muted-foreground">
                  Bật chế độ tối để giảm mỏi mắt khi xem phim
                </p>
              </div>
              <Switch
                checked={selectedTheme.includes("dark")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleThemeChange("midnight-neon");
                  } else {
                    handleThemeChange("light");
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Cài đặt thông báo
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Thông báo khi có phim mới
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi có phim mới trong thể loại bạn theo dõi
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Thông báo cập nhật tập mới
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo khi phim bạn đang theo dõi có tập mới
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Thông báo khuyến mãi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo về các chương trình khuyến mãi đặc biệt
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Button onClick={handleSaveNotifications}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Quyền riêng tư và bảo mật
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Lưu lịch sử xem
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cho phép lưu trữ lịch sử xem phim của bạn
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Đồng bộ với đám mây
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Đồng bộ dữ liệu của bạn khi đăng nhập trên các thiết bị khác
                  </p>
                </div>
                <Switch defaultChecked={isAuthenticated} disabled={!isAuthenticated} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Xóa lịch sử tìm kiếm
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Xóa tất cả lịch sử tìm kiếm của bạn
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Xóa
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Xóa tài khoản
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
            </p>
            <Button variant="destructive" disabled={!isAuthenticated}>
              Xóa tài khoản
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingField === "name" ? "Chỉnh sửa họ và tên" : "Chỉnh sửa tên người dùng"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-value" className="sr-only">
              {editingField === "name" ? "Họ và tên" : "Tên người dùng"}
            </Label>
            <Input
              id="edit-value"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={
                editingField === "name"
                  ? "Nhập họ và tên của bạn"
                  : "Nhập tên người dùng (3-30 ký tự)"
              }
              disabled={isSaving}
            />
            {editingField === "username" && (
              <p className="text-xs text-muted-foreground mt-2">
                Chỉ sử dụng chữ cái, số và dấu gạch dưới. Tối thiểu 3 ký tự.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editValue.trim()}>
              {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
