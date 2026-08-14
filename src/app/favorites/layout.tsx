"use client";

import { Heart, FolderOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "favorites", label: "Yêu thích", href: "/favorites", icon: Heart },
  { id: "collections", label: "Bộ sưu tập", href: "/favorites/collections", icon: FolderOpen },
];

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Phim đã lưu
        </h1>
        <p className="text-muted-foreground text-sm">
          Quản lý danh sách phim yêu thích và bộ sưu tập của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit mb-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
