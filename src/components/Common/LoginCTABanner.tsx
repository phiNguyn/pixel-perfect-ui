"use client";

import { useEffect, useState } from "react";
import { Cloud, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface LoginCTABannerProps {
  /** Unique key to remember dismissal per placement */
  storageKey: string;
  title?: string;
  description?: string;
  /** Hide for N days after dismissal. Default 7. */
  dismissDays?: number;
  className?: string;
}

const STORAGE_PREFIX = "pinuss-flix-login-cta:";

export default function LoginCTABanner({
  storageKey,
  title = "Đăng nhập để đồng bộ dữ liệu lên đám mây",
  description = "Lịch sử xem của bạn sẽ được lưu lại, đổi thiết bị vẫn còn nguyên.",
  dismissDays = 7,
  className,
}: LoginCTABannerProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { openLoginModal } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
      if (!raw) {
        setDismissed(false);
        return;
      }
      const until = Number(raw);
      if (Number.isFinite(until) && Date.now() < until) {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      const until = Date.now() + dismissDays * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_PREFIX + storageKey, String(until));
    } catch {
      /* ignore */
    }
  };

  if (!hasHydrated || isAuthenticated || dismissed) return null;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex-shrink-0 hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Cloud className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          onClick={openLoginModal}
          className="h-8 px-3 text-xs"
        >
          <LogIn className="h-3.5 w-3.5 mr-1.5" />
          Đăng nhập
        </Button>
        <button
          onClick={handleDismiss}
          aria-label="Để sau"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
