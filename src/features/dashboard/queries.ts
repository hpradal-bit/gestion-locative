import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import {
  calculateAmortizationSchedule,
  calculateCashFlow,
  calculateGrossYield,
  calculateMonthlyPayment,
  calculateRemainingPrincipal,
  calculateTotalProjectCost,
  computeRentScheduleStatus,
  estimateTax,
  type TaxRegime,
} from "@/lib/finance";
import { formatMonthLabel, lastNMonthKeys, monthKey, monthsBetween } from "@/lib/date-utils";

import { deriveAlerts } from "./alerts";
import type { DashboardData } from "./types";

const HISTORY_MONTHS = 12;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function emptyDashboardData(): DashboardData {
  const months = lastNMonthKeys(HISTORY_MONTHS);
  return {
    propertiesCount: 0,
    activeTenantsCount: 0,
    totalPatrimonyValue: 0,
    totalPurchasePrice: 0,
    totalCurrentValue: 0,
    totalCapitalGain: null,
    monthlyRentTotal: 0,
    annualRentTotal: 0,
    rentCollectedThisMonth: 0,
    rentPendingThisMonth: 0,
    rentLateAmount: 0,
    monthlyExpenses: 0,
    annualExpenses: 0,
    monthlyLoanPayments: 0,
    cashFlowMonthly: 0,
    cashFlowAnnual: 0,
    estimatedAnnualTax: null,
    cashFlowMonthlyAfterTax: null,
    cashFlowAnnualAfterTax: null,
    hasCompleteTaxRegimeCoverage: false,
    averageGrossYield: 0,
    revenueSeries: months.map((month) => ({ month, amount: 0 })),
    cashFlowSeries: months.map((month) => ({
      month,
      revenue: 0,
      expenses: 0,
      loan: 0,
      cashFlow: 0,
    })),
    expenseBreakdown: [],
    remainingPrincipalSeries: months.map((month) => ({ month, amount: 0 })),
    alerts: deriveAlerts({
      propertiesCount: 0,
      lateRentCount: 0,
      loansEndingSoonCount: 0,
      leasesEndingSoonCount: 0,
    }),
  };
}

export async function getDashboardData(propertyId?: string): Promise<DashboardData> {
  const supabase = await createClient();
  const now = new Date();
  const historyStart = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1);

  let propertiesQuery = supabase.from("properties").select("*");
  let leasesQuery = supabase.from("leases").select("*").eq("status", "active");
  let loansQuery = supabase.from("loans").select("*");
  let expensesQuery = supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", historyStart.toISOString().slice(0, 10));

  if (propertyId) {
    propertiesQuery = propertiesQuery.eq("id", propertyId);
    leasesQuery = leasesQuery.eq("property_id", propertyId);
    loansQuery = loansQuery.eq("property_id", propertyId);
    expensesQuery = expensesQuery.eq("property_id", propertyId);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: properties },
    { data: leases },
    { data: loans },
    { data: expenses },
    { data: ownerProfile },
  ] = await Promise.all([
    propertiesQuery,
    leasesQuery,
    loansQuery,
    expensesQuery,
    user
      ? supabase
          .from("owner_profiles")
          .select("tmi_rate, social_charges_applicable")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const propertyRows = properties ?? [];
  const leaseRows = leases ?? [];
  const loanRows = loans ?? [];
  const expenseRows = expenses ?? [];

  if (propertyRows.length === 0) {
    return emptyDashboardData();
  }

  const leaseIds = leaseRows.map((l) => l.id);
  const { data: rentSchedules } = leaseIds.length
    ? await supabase
        .from("rent_schedules")
        .select("*")
        .in("lease_id", leaseIds)
        .gte("due_date", historyStart.toISOString().slice(0, 10))
    : { data: [] as Tables<"rent_schedules">[] };
  const scheduleRows = rentSchedules ?? [];

  const scheduleIds = scheduleRows.map((s) => s.id);
  const { data: payments } = scheduleIds.length
    ? await supabase.from("payments").select("*").in("rent_schedule_id", scheduleIds)
    : { data: [] as Tables<"payments">[] };
  const paymentRows = payments ?? [];

  const paidByScheduleId = new Map<string, number>();
  for (const payment of paymentRows) {
    paidByScheduleId.set(
      payment.rent_schedule_id,
      (paidByScheduleId.get(payment.rent_schedule_id) ?? 0) + payment.amount
    );
  }

  // --- KPIs patrimoine & loyers contractuels ---
  const totalPatrimonyValue = propertyRows.reduce(
    (sum, p) => sum + (p.purchase_price ?? 0),
    0
  );
  const totalPurchasePrice = totalPatrimonyValue;
  // Valorisation actuelle : retombe sur le prix d'achat bien par bien tant
  // qu'elle n'a pas été estimée — jamais une hypothèse implicite globale.
  const totalCurrentValue = propertyRows.reduce(
    (sum, p) => sum + (p.current_value ?? p.purchase_price ?? 0),
    0
  );
  // La plus-value n'est calculable que si AU MOINS un bien du périmètre a
  // une valorisation renseignée — sinon elle vaudrait toujours 0, ce qui
  // serait une fausse information plutôt qu'une vraie absence de donnée.
  const hasAnyValuation = propertyRows.some((p) => p.current_value != null);
  const totalCapitalGain = hasAnyValuation ? totalCurrentValue - totalPurchasePrice : null;
  const monthlyRentTotal = leaseRows.reduce(
    (sum, l) => sum + l.initial_rent + l.charges,
    0
  );
  const annualRentTotal = monthlyRentTotal * 12;

  // --- Statuts d'échéances (jamais stockés, toujours recalculés) ---
  const currentMonthKey = monthKey(now);
  let rentCollectedThisMonth = 0;
  let rentPendingThisMonth = 0;
  let rentLateAmount = 0;
  let lateRentCount = 0;

  for (const schedule of scheduleRows) {
    const totalDue = schedule.rent_amount + schedule.charges_amount;
    const totalPaid = paidByScheduleId.get(schedule.id) ?? 0;
    const dueDate = new Date(schedule.due_date);
    const status = computeRentScheduleStatus({ dueDate, totalDue, totalPaid, today: now });
    const isThisMonth = monthKey(dueDate) === currentMonthKey;

    if (status === "late") {
      rentLateAmount += totalDue - totalPaid;
      lateRentCount += 1;
    } else if (isThisMonth && (status === "pending" || status === "partial")) {
      rentPendingThisMonth += totalDue - totalPaid;
    }
  }

  for (const payment of paymentRows) {
    if (monthKey(new Date(payment.paid_at)) === currentMonthKey) {
      rentCollectedThisMonth += payment.amount;
    }
  }

  // --- Dépenses ---
  const monthlyExpenses = expenseRows
    .filter((e) => monthKey(new Date(e.expense_date)) === currentMonthKey)
    .reduce((sum, e) => sum + e.amount, 0);
  const annualExpenses = expenseRows.reduce((sum, e) => sum + e.amount, 0);

  const expenseByCategory = new Map<string, number>();
  for (const expense of expenseRows) {
    expenseByCategory.set(
      expense.category,
      (expenseByCategory.get(expense.category) ?? 0) + expense.amount
    );
  }

  // --- Crédits ---
  const loanMonthlyPayments = loanRows.map((loan) => ({
    loan,
    payment:
      calculateMonthlyPayment({
        principal: loan.initial_amount,
        annualInterestRate: loan.annual_interest_rate,
        durationMonths: loan.duration_months,
      }) + loan.monthly_insurance,
  }));
  const monthlyLoanPayments = loanMonthlyPayments.reduce((sum, l) => sum + l.payment, 0);

  const loansEndingSoonCount = loanRows.filter((loan) => {
    const monthsElapsed = monthsBetween(new Date(loan.start_date), now);
    const monthsRemaining = loan.duration_months - monthsElapsed;
    return monthsRemaining > 0 && monthsRemaining <= 6;
  }).length;

  // --- Baux ---
  const LEASE_ENDING_SOON_DAYS = 90;
  const leasesEndingSoonCount = leaseRows.filter((lease) => {
    if (!lease.end_date) return false;
    const daysRemaining = Math.floor(
      (new Date(lease.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysRemaining >= 0 && daysRemaining <= LEASE_ENDING_SOON_DAYS;
  }).length;

  // --- Cash-flow & rentabilité ---
  const cashFlowMonthly = calculateCashFlow({
    rentCollected: monthlyRentTotal,
    expenses: monthlyExpenses,
    loanPayment: monthlyLoanPayments,
  });
  const cashFlowAnnual = calculateCashFlow({
    rentCollected: annualRentTotal,
    expenses: annualExpenses,
    loanPayment: monthlyLoanPayments * 12,
  });

  const propertyYields = propertyRows
    .filter((p) => p.monthly_rent > 0)
    .map((p) =>
      calculateGrossYield({
        annualRent: p.monthly_rent * 12,
        totalProjectCost: calculateTotalProjectCost({
          purchasePrice: p.purchase_price ?? 0,
          notaryFees: p.notary_fees,
          agencyFees: p.agency_fees,
          worksBudget: p.works_budget,
          furnitureBudget: p.furniture_budget,
          otherFees: p.other_acquisition_fees,
        }),
      })
    );
  const averageGrossYield =
    propertyYields.length > 0
      ? propertyYields.reduce((sum, y) => sum + y, 0) / propertyYields.length
      : 0;

  // --- Fiscalité : estimation, pas un calcul d'impôt officiel (voir lib/finance/tax.ts) ---
  const tmiRate = ownerProfile?.tmi_rate ?? 0.3;
  const applySocialCharges = ownerProfile?.social_charges_applicable ?? true;

  const rentByProperty = new Map<string, number>();
  for (const lease of leaseRows) {
    rentByProperty.set(
      lease.property_id,
      (rentByProperty.get(lease.property_id) ?? 0) + (lease.initial_rent + lease.charges) * 12
    );
  }

  const expensesByProperty = new Map<string, number>();
  for (const expense of expenseRows) {
    expensesByProperty.set(
      expense.property_id,
      (expensesByProperty.get(expense.property_id) ?? 0) + expense.amount
    );
  }

  const interestByProperty = new Map<string, number>();
  for (const loan of loanRows) {
    const schedule = calculateAmortizationSchedule({
      principal: loan.initial_amount,
      annualInterestRate: loan.annual_interest_rate,
      durationMonths: loan.duration_months,
    });
    const monthsElapsed = monthsBetween(new Date(loan.start_date), now);
    let annualInterest = 0;
    for (let m = Math.max(0, monthsElapsed - 11); m <= monthsElapsed; m++) {
      annualInterest += schedule[m]?.interest ?? 0;
    }
    interestByProperty.set(
      loan.property_id,
      (interestByProperty.get(loan.property_id) ?? 0) + annualInterest
    );
  }

  const propertiesWithRegime = propertyRows.filter((p) => p.tax_regime != null);
  const hasCompleteTaxRegimeCoverage =
    propertyRows.length > 0 && propertiesWithRegime.length === propertyRows.length;

  const estimatedAnnualTax =
    propertiesWithRegime.length === 0
      ? null
      : propertiesWithRegime.reduce((sum, property) => {
          const ownCharges =
            property.property_tax_annual +
            property.condo_fees_annual +
            property.insurance_annual +
            property.management_fees_annual +
            property.maintenance_annual +
            property.other_charges_annual;
          const deductibleExpenses =
            ownCharges +
            (expensesByProperty.get(property.id) ?? 0) +
            (interestByProperty.get(property.id) ?? 0);

          const result = estimateTax({
            regime: property.tax_regime as TaxRegime,
            grossAnnualRent: rentByProperty.get(property.id) ?? 0,
            deductibleExpenses,
            amortization: property.annual_amortization ?? 0,
            tmiRate,
            applySocialCharges,
          });
          return sum + result.totalTax;
        }, 0);

  const cashFlowAnnualAfterTax =
    estimatedAnnualTax == null ? null : cashFlowAnnual - estimatedAnnualTax;
  const cashFlowMonthlyAfterTax =
    estimatedAnnualTax == null ? null : cashFlowMonthly - estimatedAnnualTax / 12;

  // --- Séries mensuelles ---
  const months = lastNMonthKeys(HISTORY_MONTHS, now);

  const revenueByMonth = new Map<string, number>();
  for (const payment of paymentRows) {
    const key = monthKey(new Date(payment.paid_at));
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + payment.amount);
  }

  const expensesByMonth = new Map<string, number>();
  for (const expense of expenseRows) {
    const key = monthKey(new Date(expense.expense_date));
    expensesByMonth.set(key, (expensesByMonth.get(key) ?? 0) + expense.amount);
  }

  const remainingPrincipalByMonth = new Map<string, number>();
  for (const monthLabel of months) {
    const [year, month] = monthLabel.split("-").map(Number);
    const reference = new Date(year, month - 1, 1);
    const total = loanRows.reduce((sum, loan) => {
      const monthsElapsed = monthsBetween(new Date(loan.start_date), reference);
      return (
        sum +
        calculateRemainingPrincipal({
          principal: loan.initial_amount,
          annualInterestRate: loan.annual_interest_rate,
          durationMonths: loan.duration_months,
          monthsElapsed,
        })
      );
    }, 0);
    remainingPrincipalByMonth.set(monthLabel, total);
  }

  return {
    propertiesCount: propertyRows.length,
    activeTenantsCount: new Set(leaseRows.map((l) => l.tenant_id)).size,
    totalPatrimonyValue,
    totalPurchasePrice,
    totalCurrentValue,
    totalCapitalGain,
    monthlyRentTotal,
    annualRentTotal,
    rentCollectedThisMonth,
    rentPendingThisMonth,
    rentLateAmount,
    monthlyExpenses,
    annualExpenses,
    monthlyLoanPayments,
    cashFlowMonthly,
    cashFlowAnnual,
    estimatedAnnualTax,
    cashFlowMonthlyAfterTax,
    cashFlowAnnualAfterTax,
    hasCompleteTaxRegimeCoverage,
    averageGrossYield,
    revenueSeries: months.map((month) => ({
      month,
      amount: revenueByMonth.get(month) ?? 0,
    })),
    cashFlowSeries: months.map((month) => {
      const revenue = revenueByMonth.get(month) ?? 0;
      const monthExpenses = expensesByMonth.get(month) ?? 0;
      return {
        month,
        revenue,
        expenses: monthExpenses,
        loan: monthlyLoanPayments,
        cashFlow: revenue - monthExpenses - monthlyLoanPayments,
      };
    }),
    expenseBreakdown: Array.from(expenseByCategory.entries()).map(
      ([category, amount]) => ({ category, amount })
    ),
    remainingPrincipalSeries: months.map((month) => ({
      month,
      amount: remainingPrincipalByMonth.get(month) ?? 0,
    })),
    alerts: deriveAlerts({
      propertiesCount: propertyRows.length,
      lateRentCount,
      loansEndingSoonCount,
      leasesEndingSoonCount,
    }),
  };
}

export { formatMonthLabel, startOfMonth };
