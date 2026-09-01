import { FileText, ListChecks, Mail, Trash2, Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { RentStatusBadge } from "@/components/shared/rent-status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { paginate, parsePageParam } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { PaymentsListDialog } from "@/features/payments/payments-list-dialog";
import { recordBulkPayments } from "@/features/payments/actions";
import { ReminderDialog } from "@/features/reminders/reminder-dialog";
import { getLastRemindersByScheduleIds } from "@/features/reminders/queries";
import { RentFilters } from "@/features/rent-schedules/rent-filters";
import { SelectAllCheckbox } from "@/features/rent-schedules/select-all-checkbox";
import { EditScheduleDialog } from "@/features/rent-schedules/edit-schedule-dialog";
import { deleteRentSchedule } from "@/features/rent-schedules/actions";
import { listRentSchedules } from "@/features/rent-schedules/queries";
import type { RentScheduleWithDetails } from "@/features/rent-schedules/types";
import type { RentScheduleStatus } from "@/lib/finance";
import { listProperties } from "@/features/properties/queries";
import { formatCurrency } from "@/lib/format";

const BULK_FORM_ID = "bulk-payment-form";
const RECENT_REMINDER_DAYS = 3;

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

  const [allSchedules, properties] = await Promise.all([
    listRentSchedules({ propertyId, status }),
    listProperties(),
  ]);

  // Total payé "à vie" par locataire — indépendant des filtres bien/statut
  // de cette page, pour donner une vraie vision de son historique financier.
  const hasFilters = Boolean(propertyId || status);
  const schedulesForTenantTotals = hasFilters ? await listRentSchedules({}) : allSchedules;
  const totalPaidByTenant = new Map<string, number>();
  for (const schedule of schedulesForTenantTotals) {
    if (!schedule.tenantId) continue;
    totalPaidByTenant.set(
      schedule.tenantId,
      (totalPaidByTenant.get(schedule.tenantId) ?? 0) + schedule.totalPaid
    );
  }

  const hasProperties = properties.length > 0;
  const { items: schedules, currentPage, pageCount, totalCount } = paginate(
    allSchedules,
    parsePageParam(params.page)
  );

  const lastReminderBySchedule = await getLastRemindersByScheduleIds(
    schedules.map((s) => s.id)
  );

  const columns: DataTableColumn<RentScheduleWithDetails>[] = [
    {
      header: "",
      className: "w-10",
      cell: (row) =>
        row.status === "paid" ? null : (
          <input
            type="checkbox"
            name="scheduleIds"
            value={row.id}
            form={BULK_FORM_ID}
            aria-label={`Sélectionner l'échéance de ${row.tenantName}`}
            className="size-4 accent-primary"
          />
        ),
    },
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
      header: "Total payé (locataire)",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.tenantId ? formatCurrency(totalPaidByTenant.get(row.tenantId) ?? 0) : "—"}
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
      cell: (row) => (
        <div className="flex flex-col items-end gap-1">
          <div className="flex justify-end gap-1">
            {row.status === "paid" ? (
              <Button size="sm" variant="ghost" asChild>
                <a href={`/api/quittances/${row.id}`} target="_blank" rel="noreferrer">
                  <FileText />
                  Quittance
                </a>
              </Button>
            ) : (
              <>
                <ReminderDialog
                  scheduleId={row.id}
                  lastReminderAt={lastReminderBySchedule.get(row.id)?.created_at ?? null}
                  isRecentReminder={(() => {
                    const lastAt = lastReminderBySchedule.get(row.id)?.created_at;
                    if (!lastAt) return false;
                    const days = (Date.now() - new Date(lastAt).getTime()) / (1000 * 60 * 60 * 24);
                    return days < RECENT_REMINDER_DAYS;
                  })()}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Mail />
                      Relancer
                    </Button>
                  }
                />
                <PaymentDialog
                  scheduleId={row.id}
                  remainingDue={row.totalDue - row.totalPaid}
                  trigger={
                    <Button size="sm" variant="outline">
                      Enregistrer un paiement
                    </Button>
                  }
                />
              </>
            )}
          </div>
          {lastReminderBySchedule.get(row.id) && (
            <span className="text-xs text-muted-foreground">
              Relancé le {formatDate(lastReminderBySchedule.get(row.id)!.created_at)}
            </span>
          )}
          <div className="flex justify-end gap-1">
            <PaymentsListDialog
              payments={row.payments}
              trigger={
                <Button size="sm" variant="ghost" aria-label="Voir les paiements">
                  <ListChecks />
                </Button>
              }
            />
            <EditScheduleDialog
              scheduleId={row.id}
              dueDate={row.due_date}
              rentAmount={row.rent_amount}
              chargesAmount={row.charges_amount}
            />
            <ConfirmDialog
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  aria-label="Supprimer cette échéance"
                >
                  <Trash2 />
                </Button>
              }
              title="Supprimer cette échéance ?"
              description="Cette action est irréversible et supprime aussi les paiements déjà enregistrés sur cette échéance."
              confirmLabel="Supprimer"
              action={deleteRentSchedule.bind(null, row.id)}
            />
          </div>
        </div>
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

          <form id={BULK_FORM_ID} action={recordBulkPayments} />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <SelectAllCheckbox targetName="scheduleIds" />
              Tout sélectionner
            </label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" size="sm" variant="outline">
                  Valider les paiements sélectionnés
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Valider les paiements sélectionnés ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Chaque échéance cochée sera marquée comme intégralement payée, à la date
                    d&apos;aujourd&apos;hui. Cette action ne peut pas être annulée automatiquement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction type="submit" form={BULK_FORM_ID}>
                    Valider
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div>
            <DataTable
              columns={columns}
              rows={schedules}
              rowKey={(row) => row.id}
              emptyMessage="Aucune échéance ne correspond à ces filtres."
            />
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              totalCount={totalCount}
              basePath="/loyers"
              searchParams={{ bien: propertyId, statut: statusParam }}
            />
          </div>
        </>
      )}
    </div>
  );
}
