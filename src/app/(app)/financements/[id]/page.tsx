import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RemainingPrincipalChart } from "@/components/charts/remaining-principal-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoan } from "@/features/loans/queries";
import { deleteLoan } from "@/features/loans/actions";
import { calculateAmortizationSchedule, calculateMonthlyPayment } from "@/lib/finance";
import { addMonthsClamped } from "@/lib/scheduling";
import { formatCurrency, formatPercent } from "@/lib/format";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

type AmortizationRow = ReturnType<typeof calculateAmortizationSchedule>[number] & {
  date: string;
};

export default async function CreditDetailPage({
  params,
}: PageProps<"/financements/[id]">) {
  const { id } = await params;
  const loan = await getLoan(id);

  if (!loan) {
    notFound();
  }

  const monthlyPayment = calculateMonthlyPayment({
    principal: loan.initial_amount,
    annualInterestRate: loan.annual_interest_rate,
    durationMonths: loan.duration_months,
  });

  const schedule = calculateAmortizationSchedule({
    principal: loan.initial_amount,
    annualInterestRate: loan.annual_interest_rate,
    durationMonths: loan.duration_months,
  });

  const startDate = new Date(loan.start_date);
  const scheduleWithDates: AmortizationRow[] = schedule.map((row) => ({
    ...row,
    date: addMonthsClamped(startDate, row.month - 1).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    }),
  }));

  const chartData = scheduleWithDates
    .filter((_, index) => index % 3 === 0 || index === scheduleWithDates.length - 1)
    .map((row) => ({ label: row.date, amount: row.remainingPrincipal }));

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalInsurance = loan.monthly_insurance * loan.duration_months;
  const totalCost = loan.initial_amount + totalInterest + totalInsurance;

  const columns: DataTableColumn<AmortizationRow>[] = [
    { header: "Mois", cell: (row) => `${row.month} — ${row.date}` },
    { header: "Mensualité", cell: (row) => formatCurrency(row.payment + loan.monthly_insurance) },
    { header: "Intérêts", cell: (row) => formatCurrency(row.interest) },
    { header: "Capital", cell: (row) => formatCurrency(row.principal) },
    { header: "Capital restant", cell: (row) => formatCurrency(row.remainingPrincipal) },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={loan.properties?.name ?? "Crédit"}
        description="Détail du financement et tableau d'amortissement."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/financements/${loan.id}/modifier`}>
                <Pencil />
                Modifier
              </Link>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 />
                  Supprimer
                </Button>
              }
              title="Supprimer ce crédit ?"
              description="Cette action est irréversible."
              confirmLabel="Supprimer"
              action={deleteLoan.bind(null, loan.id)}
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Montant emprunté" value={formatCurrency(loan.initial_amount)} />
          <InfoRow label="Apport" value={formatCurrency(loan.down_payment)} />
          <InfoRow label="Taux annuel" value={formatPercent(loan.annual_interest_rate)} />
          <InfoRow label="Durée" value={`${loan.duration_months} mois`} />
          <InfoRow label="Assurance mensuelle" value={formatCurrency(loan.monthly_insurance)} />
          <InfoRow
            label="Mensualité totale"
            value={
              <span className="text-base">
                {formatCurrency(monthlyPayment + loan.monthly_insurance)}
              </span>
            }
          />
          <InfoRow label="Total des intérêts" value={formatCurrency(totalInterest)} />
          <InfoRow label="Total de l'assurance" value={formatCurrency(totalInsurance)} />
          <InfoRow
            label="Coût total du crédit"
            value={<span className="text-base">{formatCurrency(totalCost)}</span>}
          />
        </CardContent>
      </Card>

      <ChartCard
        title="Capital restant dû"
        description="Évolution sur toute la durée du crédit"
      >
        <RemainingPrincipalChart data={chartData} />
      </ChartCard>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Tableau d&apos;amortissement</h2>
        <DataTable columns={columns} rows={scheduleWithDates} rowKey={(row) => String(row.month)} />
      </div>
    </div>
  );
}
