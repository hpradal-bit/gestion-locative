import Link from "next/link";
import {
  Building2,
  Landmark,
  LayoutDashboard,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { KpiGroupCard } from "@/components/shared/kpi-group-card";
import { ChartCard } from "@/components/shared/chart-card";
import { AlertsCard } from "@/components/shared/alerts-card";
import { UpcomingEventsCard } from "@/components/shared/upcoming-events-card";
import { ExpenseBreakdownList } from "@/components/shared/expense-breakdown-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CashFlowChart } from "@/components/charts/cashflow-chart";
import { RemainingPrincipalChart } from "@/components/charts/remaining-principal-chart";
import { getDashboardData } from "@/features/dashboard/queries";
import { listProperties } from "@/features/properties/queries";
import { listTenants } from "@/features/tenants/queries";
import { QuickLeaseCard } from "@/features/leases/quick-lease-card";
import { DashboardFilters } from "@/features/dashboard/dashboard-filters";
import { formatMonthLabel } from "@/lib/date-utils";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const propertyId = typeof params.bien === "string" ? params.bien : undefined;

  const [properties, tenants, data] = await Promise.all([
    listProperties(),
    listTenants(),
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
        <KpiGroupCard
          label="Patrimoine"
          value={formatCurrency(data.totalCurrentValue)}
          icon={<Building2 />}
          hint={`${data.propertiesCount} bien${data.propertiesCount > 1 ? "s" : ""}`}
          dialogTitle="Patrimoine"
          items={[
            { label: "Prix total d'achat", value: formatCurrency(data.totalPurchasePrice) },
            { label: "Valorisation actuelle totale", value: formatCurrency(data.totalCurrentValue) },
            {
              label: "Plus-value potentielle",
              value: data.totalCapitalGain == null ? "—" : formatCurrency(data.totalCapitalGain),
              hint: data.totalCapitalGain == null ? "Aucune valorisation estimée" : undefined,
              tone:
                data.totalCapitalGain == null
                  ? "default"
                  : data.totalCapitalGain >= 0
                    ? "positive"
                    : "negative",
            },
          ]}
        />
        <KpiCard
          href="/locataires"
          label="Locataires actifs"
          value={String(data.activeTenantsCount)}
          icon={Users}
          hint={`${data.propertiesCount} bien${data.propertiesCount > 1 ? "s" : ""}`}
        />
        <KpiGroupCard
          label="Loyers mensuels"
          value={formatCurrency(data.monthlyRentTotal)}
          icon={<Wallet />}
          hint={
            data.monthlyRentTotal > 0
              ? `${formatPercent((data.rentCollectedThisMonth / data.monthlyRentTotal) * 100, 0)} collecté ce mois-ci`
              : undefined
          }
          dialogTitle="Loyers"
          items={[
            { label: "Loyers mensuels contractuels", value: formatCurrency(data.monthlyRentTotal) },
            { label: "Loyers mensuels (12 mois)", value: formatCurrency(data.annualRentTotal) },
            {
              label: "Encaissés ce mois-ci",
              value: formatCurrency(data.rentCollectedThisMonth),
              tone: "positive",
            },
            { label: "En attente ce mois-ci", value: formatCurrency(data.rentPendingThisMonth) },
            {
              label: "Impayés",
              value: formatCurrency(data.rentLateAmount),
              tone: data.rentLateAmount > 0 ? "negative" : "default",
            },
          ]}
        />
        <KpiGroupCard
          label="Cash-flow (avant impôt)"
          value={formatCurrency(data.cashFlowMonthly)}
          icon={<Wallet />}
          tone={data.cashFlowMonthly >= 0 ? "positive" : "negative"}
          hint="par mois"
          dialogTitle="Cash-flow (avant impôt)"
          dialogDescription="Loyers moins remboursement de crédit — les charges n'y sont volontairement pas intégrées pour l'instant."
          items={[
            {
              label: "Cash-flow mensuel",
              value: formatCurrency(data.cashFlowMonthly),
              tone: data.cashFlowMonthly >= 0 ? "positive" : "negative",
            },
            {
              label: "Cash-flow annuel",
              value: formatCurrency(data.cashFlowAnnual),
              tone: data.cashFlowAnnual >= 0 ? "positive" : "negative",
            },
            { label: "Revenus (12 mois)", value: formatCurrency(data.annualRentTotal) },
            {
              label: "Remboursement de crédit (12 mois)",
              value: formatCurrency(data.monthlyLoanPayments * 12),
            },
          ]}
        />
        <KpiCard
          href="/rentabilite"
          label="Rentabilité moyenne"
          value={formatPercent(data.averageGrossYield)}
          icon={TrendingUp}
        />
        <KpiCard
          href="/financements"
          label="Mensualités de crédits"
          value={formatCurrency(data.monthlyLoanPayments)}
          icon={Landmark}
        />
        <KpiCard
          href="/impots"
          label="Impôt estimé (12 mois)"
          value={data.estimatedAnnualTax == null ? "—" : formatCurrency(data.estimatedAnnualTax)}
          icon={Landmark}
          hint={
            data.estimatedAnnualTax == null
              ? "Renseignez un régime fiscal par bien"
              : !data.hasCompleteTaxRegimeCoverage
                ? "Estimation partielle : régime manquant sur certains biens"
                : `Cash-flow annuel après impôt : ${
                    data.cashFlowAnnualAfterTax == null ? "—" : formatCurrency(data.cashFlowAnnualAfterTax)
                  }`
          }
        />
        <KpiGroupCard
          label="Dépenses"
          value={formatCurrency(data.annualExpenses)}
          icon={<Receipt />}
          hint="sur 12 mois"
          dialogTitle="Dépenses"
          items={[
            { label: "Dépenses ce mois-ci", value: formatCurrency(data.monthlyExpenses) },
            { label: "Dépenses (12 mois)", value: formatCurrency(data.annualExpenses) },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="rounded-full">
              <Link href="/biens/nouveau">
                <Plus />
                Ajouter un bien
              </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/locataires/nouveau">
                <Plus />
                Nouveau locataire
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/loyers">Encaisser un loyer</Link>
            </Button>
          </CardContent>
        </Card>
        <QuickLeaseCard properties={properties} tenants={tenants} />
        <UpcomingEventsCard events={data.upcomingEvents} />
        <AlertsCard alerts={data.alerts} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenus"
          description="Loyers encaissés sur les 12 derniers mois"
          className="lg:col-span-2"
        >
          <RevenueChart data={revenueData} />
        </ChartCard>
        <ChartCard
          title="Capital restant dû"
          description="Sur les crédits en cours"
        >
          <RemainingPrincipalChart data={remainingPrincipalData} />
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
            <ExpenseBreakdownList data={data.expenseBreakdown} />
          ) : (
            <p className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
              Aucune dépense enregistrée sur la période.
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
