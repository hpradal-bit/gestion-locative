export type AlertLevel = "success" | "info" | "warning" | "danger";

export type DashboardAlert = {
  id: string;
  level: AlertLevel;
  message: string;
};

export type MonthlyAmount = {
  /** Format "2026-09" */
  month: string;
  amount: number;
};

export type ExpenseCategoryAmount = {
  category: string;
  amount: number;
};

export type DashboardData = {
  propertiesCount: number;
  activeTenantsCount: number;
  totalPatrimonyValue: number;
  /** Somme des prix d'achat — figée, jamais confondue avec la valorisation actuelle. */
  totalPurchasePrice: number;
  /** Somme des valorisations actuelles ; retombe sur le prix d'achat bien par bien si non estimée. */
  totalCurrentValue: number;
  /** null tant qu'aucun bien du périmètre n'a de valorisation actuelle renseignée. */
  totalCapitalGain: number | null;

  monthlyRentTotal: number;
  annualRentTotal: number;

  rentCollectedThisMonth: number;
  rentPendingThisMonth: number;
  rentLateAmount: number;

  monthlyExpenses: number;
  annualExpenses: number;

  monthlyLoanPayments: number;

  cashFlowMonthly: number;
  cashFlowAnnual: number;

  /** null tant qu'aucun bien du périmètre n'a de régime fiscal renseigné. */
  estimatedAnnualTax: number | null;
  cashFlowMonthlyAfterTax: number | null;
  cashFlowAnnualAfterTax: number | null;
  /** false si au moins un bien du périmètre n'a pas de régime fiscal renseigné — l'estimation est alors partielle. */
  hasCompleteTaxRegimeCoverage: boolean;

  averageGrossYield: number;

  revenueSeries: MonthlyAmount[];
  cashFlowSeries: { month: string; revenue: number; expenses: number; loan: number; cashFlow: number }[];
  expenseBreakdown: ExpenseCategoryAmount[];
  remainingPrincipalSeries: MonthlyAmount[];

  alerts: DashboardAlert[];
};
