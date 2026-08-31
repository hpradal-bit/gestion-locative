import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAlert } from "@/features/dashboard/types";

const LEVEL_CONFIG = {
  success: { icon: CheckCircle2, className: "text-success" },
  info: { icon: Info, className: "text-primary" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  danger: { icon: OctagonAlert, className: "text-destructive" },
} as const;

export function AlertsCard({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const { icon: Icon, className } = LEVEL_CONFIG[alert.level];
          return (
            <div key={alert.id} className="flex items-center gap-3 text-sm">
              <Icon className={cn("size-4 shrink-0", className)} />
              <span>{alert.message}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
