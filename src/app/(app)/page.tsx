import {
  Banknote,
  Building2,
  Landmark,
  LayoutDashboard,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { AlertsCard } from "@/components/shared/alerts-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CashFlowChart } from "@/components/charts/cashflow-chart";
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { RemainingPrincipalChart } from "@/components/charts/remaining-principal-chart";
import { getDashboardData } from "@/features/dashboard/queries";
import { listProperties } from "@/features/properties/queries";
import { DashboardFilters } from "@/features/dashboard/dashboard-filters";
import { formatMonthLabel } from "@/lib/date-utils";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const propertyId = typeof params.bien === "string" ? params.bien : undefined;

  const [properties, data] = await Promise.all([
    listProperties(),
    getDashboardData(propertyId),
  ]);

  if (properties.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <PageHeader
          title="Dashboard"
          description="Vue globale de votre patrimoine locatif."
        />
        <EmptyState
          icon={LayoutDashboard}
          title="Bienvenue sur votre espace de gestion locative"
          description="Ajoutez votre premier bien pour voir apparaître ici la valeur de votre patrimoine, vos loyers, votre cash-flow et votre rentabilité — calculés automatiquement."
        />
      </div>
    );
  }

  const revenueData = data.revenueSeries.map((point) => ({
    label: formatMonthLabel(point.month),
    amount: point.amount,
  }));
  const cashFlowData = data.cashFlowSeries.map((point) => ({
    label: formatMonthLabel(point.month),
    revenue: point.revenue,
    expenses: point.expenses,
    loan: point.loan,
    cashFlow: point.cashFlow,
  }));
  const remainingPrincipalData = data.remainingPrincipalSeries.map(
    (point) => ({
      label: formatMonthLabel(point.month),
      amount: point.amount,
    })
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Vue globale de votre patrimoine locatif."
      />

      <DashboardFilters properties={properties} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Prix total d'achat"
          value={formatCurrency(data.totalPurchasePrice)}
          icon={Building2}
          hint={`${data.propertiesCount} bien${data.propertiesCount > 1 ? "s" : ""}`}
        />
        <KpiCard
          label="Valorisation actuelle totale"
          value={formatCurrency(data.totalCurrentValue)}
          icon={Building2}
        />
        <KpiCard
          label="Plus-value potentielle"
          value={data.totalCapitalGain == null ? "—" : formatCurrency(data.totalCapitalGain)}
          icon={TrendingUp}
          tone={
            data.totalCapitalGain == null
              ? "default"
              : data.totalCapitalGain >= 0
                ? "positive"
                : "negative"
          }
          hint={data.totalCapitalGain == null ? "Aucune valorisation estimée" : undefined}
        />
        <KpiCard
          label="Locataires actifs"
          value={String(data.activeTenantsCount)}
          icon={Users}
        />
        <KpiCard
          label="Loyers mensuels"
          value={formatCurrency(data.monthlyRentTotal)}
          icon={Wallet}
          hint={`${formatCurrency(data.annualRentTotal)} / an`}
        />
        <KpiCard
          label="Rentabilité moyenne"
          value={formatPercent(data.averageGrossYield)}
          icon={TrendingUp}
        />
        <KpiCard
          label="Loyers encaissés (mois)"
          value={formatCurrency(data.rentCollectedThisMonth)}
          icon={Banknote}
          tone="positive"
        />
        <KpiCard
          label="Loyers en attente"
          value={formatCurrency(data.rentPendingThisMonth)}
          icon={Wallet}
        />
        <KpiCard
          label="Impayés"
          value={formatCurrency(data.rentLateAmount)}
          icon={Wallet}
          tone={data.rentLateAmount > 0 ? "negative" : "default"}
        />
        <KpiCard
          label="Mensualités de crédits"
          value={formatCurrency(data.monthlyLoanPayments)}
          icon={Landmark}
        />
        <KpiCard
          label="Cash-flow mensuel (avant impôt)"
          value={formatCurrency(data.cashFlowMonthly)}
          icon={Wallet}
          tone={data.cashFlowMonthly >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Cash-flow annuel (avant impôt)"
          value={formatCurrency(data.cashFlowAnnual)}
          icon={Wallet}
          tone={data.cashFlowAnnual >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Impôt estimé (12 mois)"
          value={data.estimatedAnnualTax == null ? "—" : formatCurrency(data.estimatedAnnualTax)}
          icon={Landmark}
          hint={
            data.estimatedAnnualTax == null
              ? "Renseignez un régime fiscal par bien"
              : !data.hasCompleteTaxRegimeCoverage
                ? "Estimation partielle : régime manquant sur certains biens"
                : undefined
          }
        />
        <KpiCard
          label="Cash-flow annuel après impôt"
          value={
            data.cashFlowAnnualAfterTax == null
              ? "—"
              : formatCurrency(data.cashFlowAnnualAfterTax)
          }
          icon={Wallet}
          tone={
            data.cashFlowAnnualAfterTax == null
              ? "default"
              : data.cashFlowAnnualAfterTax >= 0
                ? "positive"
                : "negative"
          }
        />
        <KpiCard
          label="Dépenses (mois)"
          value={formatCurrency(data.monthlyExpenses)}
          icon={Wallet}
        />
        <KpiCard
          label="Dépenses (12 mois)"
          value={formatCurrency(data.annualExpenses)}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AlertsCard alerts={data.alerts} />
        <ChartCard
          title="Revenus"
          description="Loyers encaissés sur les 12 derniers mois"
          className="lg:col-span-2"
        >
          <RevenueChart data={revenueData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Cash-flow"
          description="Revenus, dépenses, crédit et cash-flow net"
        >
          <CashFlowChart data={cashFlowData} />
        </ChartCard>
        <ChartCard
          title="Répartition des dépenses"
          description="12 derniers mois, par catégorie"
        >
          {data.expenseBreakdown.length > 0 ? (
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          ) : (
            <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              Aucune dépense enregistrée sur la période.
            </p>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Capital restant dû"
        description="Évolution cumulée du capital restant sur les crédits en cours"
      >
        <RemainingPrincipalChart data={remainingPrincipalData} />
      </ChartCard>
    </div>
  );
}
