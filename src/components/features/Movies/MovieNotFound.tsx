"use client";

import { AlertTriangle, Film, Home, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Error from "@/components/Common/Error";

interface MovieNotFoundProps {
  type?: "not-found" | "error";
  slug?: string;
}

export default function MovieNotFound({
  type = "not-found",
  slug,
}: MovieNotFoundProps) {
  const router = useRouter();
  const isError = type === "error";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 mt-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            {isError ? (
              <AlertTriangle className="w-12 h-12 text-destructive" />
            ) : (
              <Film className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {isError ? "Đã xảy ra lỗi" : "Không tìm thấy phim"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isError
              ? "Không thể tải thông tin phim lúc này. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn."
              : slug
                ? `Phim "${slug}" không tồn tại hoặc đã bị xóa khỏi hệ thống.`
                : "Phim bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isError && (
            <Button
              onClick={() => router.refresh()}
              className="gap-2 rounded-full px-6"
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại
            </Button>
          )}
          <Button variant="outline" className="gap-2 rounded-full px-6" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="gap-2 rounded-full px-6 text-muted-foreground"
            asChild
          >
            <Link href="/">
              <Search className="w-4 h-4" />
              Tìm phim khác
            </Link>
          </Button>
        </div>

        {/* Decorative */}
        {/* <div className="pt-4 flex items-center justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
            />
          ))}
        </div> */}
        <Error />
      </div>
    </div>
  );
}
