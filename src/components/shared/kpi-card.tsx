import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  className?: string;
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("gap-3 py-5", className)}>
      <CardContent className="flex items-start justify-between gap-3 px-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight",
              tone === "positive" && "text-success",
              tone === "negative" && "text-destructive"
            )}
          >
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
