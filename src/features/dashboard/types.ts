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

  averageGrossYield: number;

  revenueSeries: MonthlyAmount[];
  cashFlowSeries: { month: string; revenue: number; expenses: number; loan: number; cashFlow: number }[];
  expenseBreakdown: ExpenseCategoryAmount[];
  remainingPrincipalSeries: MonthlyAmount[];

  alerts: DashboardAlert[];
};
