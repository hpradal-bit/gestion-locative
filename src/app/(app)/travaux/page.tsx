import Link from "next/link";
import { Hammer, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listWorks } from "@/features/works/queries";
import { listProperties } from "@/features/properties/queries";
import { WORK_STATUS_BADGE_VARIANT, WORK_STATUS_LABELS } from "@/features/works/constants";
import type { workStatuses } from "@/features/works/schema";
import { formatCurrency } from "@/lib/format";

type WorkStatus = (typeof workStatuses)[number];
type WorkRow = Awaited<ReturnType<typeof listWorks>>[number];

export default async function TravauxPage() {
  const [works, properties] = await Promise.all([listWorks(), listProperties()]);

  const columns: DataTableColumn<WorkRow>[] = [
    { header: "Bien", cell: (row) => row.properties?.name ?? "Bien supprimé" },
    { header: "Description", cell: (row) => row.description },
    { header: "Entreprise", cell: (row) => row.company ?? "—" },
    {
      header: "Statut",
      cell: (row) => (
        <Badge variant={WORK_STATUS_BADGE_VARIANT[row.status as WorkStatus]}>
          {WORK_STATUS_LABELS[row.status as WorkStatus] ?? row.status}
        </Badge>
      ),
    },
    {
      header: "Montant",
      className: "text-right",
      cell: (row) => formatCurrency(row.actual_amount ?? row.estimated_amount),
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/travaux/${row.id}/modifier`}>Modifier</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Travaux"
        description="Devis, chantiers, factures et suivi."
        action={
          <Button asChild>
            <Link href="/travaux/nouveau">
              <Plus />
              Ajouter un chantier
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Hammer}
          title="Aucun chantier pour l'instant"
          description="Ajoutez d'abord un bien pour pouvoir y associer des travaux."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={works}
          rowKey={(row) => row.id}
          emptyMessage="Aucun chantier pour l'instant."
        />
      )}
    </div>
  );
}
