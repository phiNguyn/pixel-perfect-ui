import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaginationInfo } from "@/lib/api/admin/adminInterface";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminSectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={title || action ? "pt-0" : "p-0"}>
        {children}
      </CardContent>
    </Card>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

export function AdminPagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
      <p className="text-sm text-muted-foreground">
        Trang {pagination.page} / {pagination.totalPages}
        <span className="hidden sm:inline">
          {" "}
          · {pagination.total.toLocaleString()} mục
        </span>
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
