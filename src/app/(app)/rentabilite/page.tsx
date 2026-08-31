import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { YieldComparisonChart } from "@/components/charts/yield-comparison-chart";
import { getPropertiesProfitability } from "@/features/profitability/queries";
import type { PropertyProfitability } from "@/features/profitability/queries";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function RentabilitePage() {
  const rows = await getPropertiesProfitability();

  const columns: DataTableColumn<PropertyProfitability>[] = [
    {
      header: "Bien",
      cell: (row) => (
        <Link href={`/biens/${row.property.id}`} className="font-medium hover:underline">
          {row.property.name}
        </Link>
      ),
    },
    { header: "Coût total", cell: (row) => formatCurrency(row.totalProjectCost) },
    { header: "Loyer annuel", cell: (row) => formatCurrency(row.annualRent) },
    { header: "Rentabilité brute", cell: (row) => formatPercent(row.grossYield) },
    { header: "Rentabilité nette", cell: (row) => formatPercent(row.netYield) },
    {
      header: "Nette après financement",
      cell: (row) => formatPercent(row.netYieldAfterFinancing),
    },
    {
      header: "Cash-flow annuel",
      className: "text-right",
      cell: (row) => (
        <span className={row.cashFlow >= 0 ? "text-success" : "text-destructive"}>
          {formatCurrency(row.cashFlow)}
        </span>
      ),
    },
  ];

  const chartData = rows.map((row) => ({
    label: row.property.name,
    grossYield: Number(row.grossYield.toFixed(1)),
    netYield: Number(row.netYield.toFixed(1)),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Rentabilité"
        description="Analyse financière de chaque investissement."
        action={
          <Button variant="outline" asChild>
            <Link href="/biens">Gérer les biens</Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Aucune analyse pour l'instant"
          description="Ajoutez un bien pour voir apparaître ici sa rentabilité brute, nette, nette après financement et son cash-flow."
        />
      ) : (
        <>
          <ChartCard
            title="Comparaison des biens"
            description="Rentabilité brute et nette par bien"
          >
            <YieldComparisonChart data={chartData} />
          </ChartCard>
          <DataTable columns={columns} rows={rows} rowKey={(row) => row.property.id} />
        </>
      )}
    </div>
  );
}
