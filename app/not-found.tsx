import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Trang không tồn tại
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
