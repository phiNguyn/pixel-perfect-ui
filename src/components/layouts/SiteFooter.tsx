"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AvatarComponent from "../Common/Avatar";
import { SITE_DISCLAIMER_TEXT } from "@/lib/site-disclaimer";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstall}
      className="w-fit h-fit ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
    >
      <Download className="w-4 h-4" />
      Tải ứng dụng
    </button>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.includes("/admin")) {
    return null;
  }
  return (
    <footer
      className={cn(
        "border-t border-border/50 mt-8 py-8 pb-[calc(2rem+4rem+env(safe-area-inset-bottom))] md:pb-8",
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-8 flex flex-col gap-5 border-b border-border/60 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-col flex gap-2">
            <AvatarComponent />
            <div className="block md:hidden ">
              <InstallButton />
            </div>
          </div>

          <div className="flex-col md:flex-row flex gap-2">
            <div className="flex-col md:flex-row flex items-center gap-2">
              <a
                href="https://unikorn.vn/p/pinuss-flix?ref=embed-pinuss-flix"
                target="_blank"
              >
                <img
                  src="https://unikorn.vn/api/widgets/badge/pinuss-flix/rank?theme=light&type=daily"
                  alt="Pinuss Flix - Hàng ngày"
                  className="h-8 md:h-12 w-auto"
                />
              </a>
              <a
                href="https://unikorn.vn/p/pinuss-flix?ref=embed-pinuss-flix"
                target="_blank"
              >
                <img
                  src="https://unikorn.vn/api/widgets/badge/pinuss-flix/rank?theme=light&type=weekly"
                  alt="Pinuss Flix - Hàng tuần"
                  className="h-8 md:h-12 w-auto"
                />
              </a>
            </div>
            <div className="hidden md:block">
              <InstallButton />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground mb-6">
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Phim Hay</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Phim Bộ
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Phim Lẻ
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Phim Chiếu Rạp
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Thể Loại</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Hành Động
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Tình Cảm
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Kinh Dị
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Quốc Gia</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Hàn Quốc
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Trung Quốc
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Nhật Bản
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Hỗ Trợ</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Liên hệ
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Điều khoản
            </p>
            <p className="hover:text-foreground cursor-pointer transition-colors">
              Bảo mật
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">© 2025 Pinuss Flix.</p>
        <p className="text-sm text-muted-foreground">{SITE_DISCLAIMER_TEXT}</p>
      </div>
    </footer>
  );
}
