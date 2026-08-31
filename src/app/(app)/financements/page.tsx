import Link from "next/link";
import { Landmark, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { calculateMonthlyPayment } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { listLoans } from "@/features/loans/queries";
import { listProperties } from "@/features/properties/queries";

type LoanRow = Awaited<ReturnType<typeof listLoans>>[number];

export default async function FinancementsPage() {
  const [loans, properties] = await Promise.all([listLoans(), listProperties()]);

  const columns: DataTableColumn<LoanRow>[] = [
    { header: "Bien", cell: (row) => row.properties?.name ?? "Bien supprimé" },
    { header: "Montant emprunté", cell: (row) => formatCurrency(row.initial_amount) },
    { header: "Taux", cell: (row) => formatPercent(row.annual_interest_rate) },
    {
      header: "Mensualité",
      cell: (row) => {
        const payment = calculateMonthlyPayment({
          principal: row.initial_amount,
          annualInterestRate: row.annual_interest_rate,
          durationMonths: row.duration_months,
        });
        return formatCurrency(payment + row.monthly_insurance);
      },
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/financements/${row.id}`}>Voir</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Financements"
        description="Crédits immobiliers et tableaux d'amortissement."
        action={
          <Button asChild>
            <Link href="/financements/nouveau">
              <Plus />
              Ajouter un crédit
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Aucun crédit pour l'instant"
          description="Ajoutez d'abord un bien pour pouvoir y associer un financement."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={loans}
          rowKey={(row) => row.id}
          emptyMessage="Aucun crédit pour l'instant."
        />
      )}
    </div>
  );
}
