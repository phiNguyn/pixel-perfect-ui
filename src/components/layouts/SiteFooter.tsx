import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-8 py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Link to={'/'} className="flex items-center gap-2">
            <Avatar className="size-8 mb-1.5">
              <AvatarImage src={`https://api-sandbox.vnhub.com/resource/2026/02/27/1772203272485-1000003143.png`} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">PF</AvatarFallback>
            </Avatar>
            <span className="text-foreground font-bold text-lg tracking-tight">Pinuss Flix</span>
          </Link>
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
        <p className="text-[10px] text-muted-foreground">© 2025 Pinuss Flix. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}
