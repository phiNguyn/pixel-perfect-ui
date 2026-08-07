"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAccountMenuContent from "@/components/layouts/navigation/UserAccountMenuContent";

type HeaderAuthSectionProps = {
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function HeaderAuthSection({
  user,
  isAuthenticated,
  onLogin,
  onLogout,
}: HeaderAuthSectionProps) {
  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.avatar || ""}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <UserAccountMenuContent user={user} onLogout={onLogout} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={onLogin} className="ml-2">
      <User className="w-4 h-4 mr-2" />
      Đăng nhập
    </Button>
  );
}
