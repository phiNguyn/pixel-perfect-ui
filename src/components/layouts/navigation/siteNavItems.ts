import {
  Home,
  Search,
  Compass,
  History,
  User,
  type LucideIcon,
} from "lucide-react";

export type MobileNavId =
  | "home"
  | "search"
  | "explore"
  | "history"
  | "account";

export type MobileNavItem =
  | {
      id: MobileNavId;
      label: string;
      href: string;
      icon: LucideIcon;
      action?: never;
    }
  | {
      id: MobileNavId;
      label: string;
      href?: never;
      icon: LucideIcon;
      action: "search" | "explore" | "account";
    };

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { id: "home", label: "Trang chủ", href: "/", icon: Home },
  { id: "search", label: "Tìm kiếm", icon: Search, action: "search" },
  { id: "explore", label: "Khám phá", icon: Compass, action: "explore" },
  {
    id: "history",
    label: "Lịch sử",
    href: "/watch-histories",
    icon: History,
  },
  { id: "account", label: "Tài khoản", icon: User, action: "account" },
];

export function getActiveMobileNavId(
  pathname: string,
  openPanel: MobileNavId | null,
): MobileNavId | null {
  if (openPanel) return openPanel;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/watch-histories")) return "history";
  if (pathname.startsWith("/the-loai") || pathname.startsWith("/quoc-gia")) {
    return "explore";
  }
  if (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/watch-calendar") ||
    pathname.startsWith("/leaderboard")
  ) {
    return "account";
  }
  return null;
}
