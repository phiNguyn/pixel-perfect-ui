"use client";

import { User } from "lucide-react";
import BaseDrawer from "./BaseDrawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import UserAccountMenuContent from "@/components/layouts/navigation/UserAccountMenuContent";
import type { User as AuthUser } from "@/stores/useAuthStore";

type MobileAccountSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export default function MobileAccountSheet({
  open,
  onOpenChange,
  user,
  isAuthenticated,
  onLogin,
  onLogout,
}: MobileAccountSheetProps) {
  const closeSheet = () => onOpenChange(false);

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tài khoản"
      contentClassName="p-0 max-h-[85dvh] overflow-hidden"
    >
      <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {isAuthenticated ? (
          <UserAccountMenuContent
            user={user}
            onNavigate={closeSheet}
            onLogout={onLogout}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">Chưa đăng nhập</p>
              <p className="text-xs text-muted-foreground">
                Đăng nhập để lưu lịch sử xem và đồng bộ trên nhiều thiết bị
              </p>
            </div>
            <Button
              onClick={() => {
                closeSheet();
                onLogin();
              }}
              className="w-full max-w-xs"
            >
              <User className="w-4 h-4 mr-2" />
              Đăng nhập
            </Button>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Giao diện</span>
              <ThemeSelector />
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
}
