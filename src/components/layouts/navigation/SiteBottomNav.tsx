"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MOBILE_NAV_ITEMS,
  type MobileNavId,
} from "@/components/layouts/navigation/siteNavItems";

type SiteBottomNavProps = {
  activeId: MobileNavId | null;
  onSearchClick: () => void;
  onExploreClick: () => void;
  onAccountClick: () => void;
};

export default function SiteBottomNav({
  activeId,
  onSearchClick,
  onExploreClick,
  onAccountClick,
}: SiteBottomNavProps) {
  const actionHandlers = {
    search: onSearchClick,
    explore: onExploreClick,
    account: onAccountClick,
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_hsl(var(--background)/0.35)] backdrop-blur-xl md:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-stretch px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={actionHandlers[item.action]}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
