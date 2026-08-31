import { Badge } from "@/components/ui/badge";
import type { RentScheduleStatus } from "@/lib/finance";

const STATUS_CONFIG: Record<
  RentScheduleStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  paid: { label: "Payé", variant: "success" },
  pending: { label: "En attente", variant: "secondary" },
  late: { label: "En retard", variant: "destructive" },
  partial: { label: "Partiellement payé", variant: "warning" },
};

export function RentStatusBadge({ status }: { status: RentScheduleStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
