"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  MessageSquare,
  Trophy,
  CalendarHeart,
  Sparkles,
  LogIn,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface LoginBenefitsCardProps {
  /** Unique key for dismissal persistence per placement. */
  storageKey: string;
  /** Hide after dismissal for N days. Default 7. */
  dismissDays?: number;
  /** Optional custom title. */
  title?: string;
  /** Optional custom subtitle. */
  subtitle?: string;
  /** Visual variant. `inline` = compact card for in-page use, `hero` = larger card for home page. */
  variant?: "inline" | "hero";
  className?: string;
  /** Allow user to dismiss. Default true. */
  dismissible?: boolean;
}

const STORAGE_PREFIX = "pinuss-flix-login-benefits:";

const BENEFITS = [
  {
    icon: Cloud,
    title: "Đồng bộ đa thiết bị",
    desc: "Lịch sử & lịch xem lưu trên đám mây, đổi máy vẫn còn.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    href: "/watch-histories",
  },
  {
    icon: CalendarHeart,
    title: "Lịch xem cá nhân hoá",
    desc: "Lên kế hoạch xem phim mỗi ngày, nhắc nhở thông minh.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    href: "/watch-calendar",
  },
  {
    icon: MessageSquare,
    title: "Bình luận & thảo luận",
    desc: "Chia sẻ cảm nhận, phản hồi cùng cộng đồng người xem.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    href: "/watch-histories",
  },
  {
    icon: Trophy,
    title: "Bảng xếp hạng",
    desc: "Ghi danh thời gian xem, leo top bảng xếp hạng tuần.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    href: "/leaderboard",
  },
  {
    icon: Sparkles,
    title: "Gợi ý riêng cho bạn",
    desc: "Đề xuất phim chính xác hơn dựa trên lịch sử cá nhân.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    href: "/watch-histories",
  },
  {
    icon: ShieldCheck,
    title: "An toàn dữ liệu",
    desc: "Tài khoản bảo mật, không lo mất dữ liệu khi xoá trình duyệt.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    href: "/settings",
  },
];

export default function LoginBenefitsCard({
  storageKey,
  dismissDays = 7,
  title = "Mở khoá trải nghiệm xem phim trọn vẹn",
  subtitle = "Đăng nhập miễn phí trong vài giây để dùng đủ tính năng của PinussFlix.",
  variant = "hero",
  className,
  dismissible = true,
}: LoginBenefitsCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { openLoginModal } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!dismissible) {
      setDismissed(false);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
      if (!raw) return setDismissed(false);
      const until = Number(raw);
      setDismissed(Number.isFinite(until) && Date.now() < until);
    } catch {
      setDismissed(false);
    }
  }, [storageKey, dismissible]);

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

  const isHero = variant === "hero";

  return (
    <section
      className={cn("relative", isHero ? "py-4" : "py-2", className)}
      aria-label="Đăng nhập để mở khoá tính năng"
    >
      <div className={cn("max-w-[1560px] mx-auto", isHero ? "px-4" : "")}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-primary/20",
            "bg-gradient-to-br from-primary/15 via-background/60 to-background/30 backdrop-blur-xl",
            "shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)]",
          )}
        >
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
          />

          {/* {dismissible && (
            <button
              onClick={handleDismiss}
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )} */}

          <div
            className={cn(
              "relative grid gap-6 p-5 sm:p-6 md:p-8",
              isHero
                ? "md:grid-cols-[1.05fr_1.6fr] md:gap-10"
                : "md:grid-cols-[1fr_1.4fr]",
            )}
          >
            {/* Left: Header & CTA */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                Miễn phí
              </span>
              <h2
                className={cn(
                  "mt-3 font-bold text-foreground leading-tight tracking-tight",
                  isHero
                    ? "text-2xl sm:text-3xl md:text-[2rem]"
                    : "text-xl sm:text-2xl",
                )}
              >
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
                {subtitle}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={openLoginModal}
                  className="h-11 px-6 text-sm font-semibold shadow-lg shadow-primary/30"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Đăng nhập ngay
                </Button>
                {/* {dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                  >
                    Để sau
                  </button>
                )} */}
              </div>
            </div>

            {/* Right: Benefits grid */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                const content = (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                        b.bg,
                        b.color,
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {b.title}
                        </p>
                        <ArrowRight
                          className={cn(
                            "h-3 w-3 opacity-60 transition-all duration-300",
                            b.color,
                            b.href && "group-hover:opacity-100 group-hover:translate-x-0.5",
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {b.desc}
                      </p>
                    </div>
                  </>
                );

                return (
                  <motion.li
                    key={b.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3 backdrop-blur-sm transition-colors",
                      b.href
                        ? "group cursor-pointer hover:border-primary/30 hover:bg-background/60"
                        : "",
                    )}
                  >
                    {b.href ? (
                      <Link
                        href={b.href}
                        className="flex items-start gap-3 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
                        prefetch={false}
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
