import { Bell, Send } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertsCard } from "@/components/shared/alerts-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/features/dashboard/queries";
import { listRentSchedules } from "@/features/rent-schedules/queries";
import { listReminders } from "@/features/reminders/queries";
import { ReminderDialog } from "@/features/reminders/reminder-dialog";
import type { RentScheduleWithDetails } from "@/features/rent-schedules/types";
import { formatCurrency } from "@/lib/format";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const LEVEL_LABELS: Record<number, string> = { 1: "Niveau 1", 2: "Niveau 2", 3: "Niveau 3" };

export default async function NotificationsPage() {
  const [dashboardData, lateSchedules, reminders] = await Promise.all([
    getDashboardData(),
    listRentSchedules({ status: "late" }),
    listReminders(),
  ]);

  const lateColumns: DataTableColumn<RentScheduleWithDetails>[] = [
    {
      header: "Bien / Locataire",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.propertyName}</p>
          <p className="text-xs text-muted-foreground">{row.tenantName}</p>
        </div>
      ),
    },
    { header: "Échéance", cell: (row) => formatDate(row.due_date) },
    {
      header: "Montant dû",
      cell: (row) => formatCurrency(row.totalDue - row.totalPaid),
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <ReminderDialog
          scheduleId={row.id}
          trigger={
            <Button size="sm" variant="outline">
              <Send />
              Relancer
            </Button>
          }
        />
      ),
    },
  ];

  type ReminderRow = (typeof reminders)[number];
  const historyColumns: DataTableColumn<ReminderRow>[] = [
    { header: "Date", cell: (row) => formatDate(row.created_at) },
    {
      header: "Bien / Locataire",
      cell: (row) => {
        const lease = row.rent_schedules?.leases;
        const tenant = lease?.tenants;
        return (
          <div>
            <p className="font-medium">{lease?.properties?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {tenant ? `${tenant.first_name} ${tenant.last_name}` : "—"}
            </p>
          </div>
        );
      },
    },
    { header: "Niveau", cell: (row) => LEVEL_LABELS[row.level] ?? row.level },
    {
      header: "Statut",
      cell: (row) => (
        <Badge variant={row.status === "sent" ? "success" : "destructive"}>
          {row.status === "sent" ? "Envoyée" : "Échec"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Notifications" description="Relances et alertes." />

      <AlertsCard alerts={dashboardData.alerts} />

      {lateSchedules.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Loyers en retard</h2>
          <DataTable columns={lateColumns} rows={lateSchedules} rowKey={(row) => row.id} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Historique des relances</h2>
        {reminders.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune relance envoyée"
            description="L'historique de vos relances apparaîtra ici."
          />
        ) : (
          <DataTable columns={historyColumns} rows={reminders} rowKey={(row) => row.id} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envoi d&apos;emails</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          L&apos;envoi réel des relances nécessite une clé Resend configurée
          (variable d&apos;environnement <code>RESEND_API_KEY</code>). Sans elle, la relance est
          enregistrée dans l&apos;historique avec un message d&apos;erreur clair.
        </CardContent>
      </Card>
    </div>
  );
}
