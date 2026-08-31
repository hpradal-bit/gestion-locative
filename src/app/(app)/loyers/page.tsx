import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RentStatusBadge } from "@/components/shared/rent-status-badge";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { RentFilters } from "@/features/rent-schedules/rent-filters";
import { listRentSchedules } from "@/features/rent-schedules/queries";
import type { RentScheduleWithDetails } from "@/features/rent-schedules/types";
import type { RentScheduleStatus } from "@/lib/finance";
import { listProperties } from "@/features/properties/queries";
import { formatCurrency } from "@/lib/format";

const VALID_STATUSES: RentScheduleStatus[] = ["paid", "pending", "late", "partial"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LoyersPage({
  searchParams,
}: PageProps<"/loyers">) {
  const params = await searchParams;
  const propertyId = typeof params.bien === "string" ? params.bien : undefined;
  const statusParam = typeof params.statut === "string" ? params.statut : undefined;
  const status = VALID_STATUSES.includes(statusParam as RentScheduleStatus)
    ? (statusParam as RentScheduleStatus)
    : undefined;

  const [schedules, properties] = await Promise.all([
    listRentSchedules({ propertyId, status }),
    listProperties(),
  ]);

  const hasProperties = properties.length > 0;

  const columns: DataTableColumn<RentScheduleWithDetails>[] = [
    {
      header: "Bien / Locataire",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.propertyName}</p>
          <p className="text-xs text-muted-foreground">{row.tenantName}</p>
        </div>
      ),
    },
    {
      header: "Échéance",
      cell: (row) => formatDate(row.due_date),
    },
    {
      header: "Montant dû",
      cell: (row) => formatCurrency(row.totalDue),
    },
    {
      header: "Payé",
      cell: (row) => (
        <span className={row.totalPaid > 0 ? "" : "text-muted-foreground"}>
          {formatCurrency(row.totalPaid)}
        </span>
      ),
    },
    {
      header: "Statut",
      cell: (row) => <RentStatusBadge status={row.status} />,
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) =>
        row.status === "paid" ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <PaymentDialog
            scheduleId={row.id}
            remainingDue={row.totalDue - row.totalPaid}
            trigger={
              <Button size="sm" variant="outline">
                Enregistrer un paiement
              </Button>
            }
          />
        ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Loyers"
        description="Échéances, paiements, statuts et historique."
      />

      {!hasProperties ? (
        <EmptyState
          icon={Wallet}
          title="Aucune échéance pour l'instant"
          description="Ajoutez un bien puis créez un bail pour générer automatiquement les échéances de loyer."
        />
      ) : (
        <>
          <RentFilters properties={properties} />
          <DataTable
            columns={columns}
            rows={schedules}
            rowKey={(row) => row.id}
            emptyMessage="Aucune échéance ne correspond à ces filtres."
          />
        </>
      )}
    </div>
  );
}
