"use client";

import { User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0">
        <SheetHeader className="border-b border-border/50 p-4">
          <SheetTitle className="text-foreground font-bold text-lg tracking-tight">
            Tài khoản
          </SheetTitle>
        </SheetHeader>

        <div className="p-4">
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
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
