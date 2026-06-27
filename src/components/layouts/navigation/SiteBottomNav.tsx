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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
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
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
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
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
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
