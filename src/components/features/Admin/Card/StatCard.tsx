import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = "primary",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  accent?: "primary" | "emerald" | "sky" | "amber";
}) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
              {value.toLocaleString()}
            </p>
            {trend !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium mt-2",
                  trend >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500",
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {trend >= 0 ? "+" : ""}
                {trend}% {trendLabel}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              accentStyles[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
