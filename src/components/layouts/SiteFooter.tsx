"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AvatarComponent from "../Common/Avatar";

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
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
    >
      <Download className="w-4 h-4" />
      Tải ứng dụng
    </button>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-8 py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <AvatarComponent />
          <InstallButton />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground mb-6">
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Phim Hay</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Phim Bộ</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Phim Lẻ</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Phim Chiếu Rạp</p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Thể Loại</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Hành Động</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Tình Cảm</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Kinh Dị</p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Quốc Gia</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Hàn Quốc</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Trung Quốc</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Nhật Bản</p>
          </div>
          <div className="space-y-2">
            <p className="text-secondary-foreground font-medium">Hỗ Trợ</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Liên hệ</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Điều khoản</p>
            <p className="hover:text-foreground cursor-pointer transition-colors">Bảo mật</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">© 2025 Pinuss Flix.</p>
        <p className="text-[12px] text-muted-foreground">Lưu ý: Chúng tôi từ chối mọi trách nhiệm liên quan đến nội dung hiển thị/tồn tại trên trang. Tất cả video và dữ liệu tại đây đều được tổng hợp từ các nguồn phổ biến trên Internet, và không thuộc quyền sở hữu hay kiểm soát của chúng tôi. Chúng tôi không cung cấp dịch vụ phát trực tuyến chính thức. Nếu bạn cho rằng quyền lợi của mình bị ảnh hưởng, vui lòng liên hệ ngay cho chúng tôi sẽ xử lý và gỡ bỏ nội dung vi phạm kịp thời. Xin cảm ơn sự thông cảm và hợp tác của bạn.</p>
      </div>
    </footer>
  );
}
