import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function AdminSectionCard({
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
