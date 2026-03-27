import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export default function Empty({
  icon: Icon,
  title = "Không có dữ liệu",
  description,
  action,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-4 text-xs"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
