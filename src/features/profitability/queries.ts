import { createClient } from "@/lib/supabase/server";
import {
  calculateAmortizationSchedule,
  calculateCashFlow,
  calculateGrossYield,
  calculateMonthlyPayment,
  calculateNetYield,
  calculateNetYieldAfterFinancing,
  calculateTotalProjectCost,
} from "@/lib/finance";
import { monthsBetween } from "@/lib/date-utils";
import type { Tables } from "@/lib/supabase/database.types";

export type PropertyProfitability = {
  property: Tables<"properties">;
  totalProjectCost: number;
  annualRent: number;
  annualRecurringExpenses: number;
  annualLoanInterestAndInsurance: number;
  annualLoanPayment: number;
  grossYield: number;
  netYield: number;
  netYieldAfterFinancing: number;
  cashFlow: number;
};

/** Intérêts + assurance dus sur les 12 prochains mois pour un crédit, à date. */
function annualInterestAndInsurance(loan: Tables<"loans">, now: Date): number {
  const monthsElapsed = Math.max(0, monthsBetween(new Date(loan.start_date), now));
  const schedule = calculateAmortizationSchedule({
    principal: loan.initial_amount,
    annualInterestRate: loan.annual_interest_rate,
    durationMonths: loan.duration_months,
  });
  const window = schedule.slice(monthsElapsed, monthsElapsed + 12);
  const interest = window.reduce((sum, row) => sum + row.interest, 0);
  return interest + loan.monthly_insurance * window.length;
}

function annualLoanPayment(loan: Tables<"loans">): number {
  const payment = calculateMonthlyPayment({
    principal: loan.initial_amount,
    annualInterestRate: loan.annual_interest_rate,
    durationMonths: loan.duration_months,
  });
  return (payment + loan.monthly_insurance) * 12;
}

export async function getPropertiesProfitability(): Promise<PropertyProfitability[]> {
  const supabase = await createClient();
  const now = new Date();

  const [{ data: properties }, { data: leases }, { data: loans }] = await Promise.all([
    supabase.from("properties").select("*"),
    supabase.from("leases").select("*").eq("status", "active"),
    supabase.from("loans").select("*"),
  ]);

  const propertyRows = properties ?? [];
  const leaseRows = leases ?? [];
  const loanRows = loans ?? [];

  return propertyRows.map((property) => {
    const activeLease = leaseRows.find((l) => l.property_id === property.id);
    const annualRent = activeLease
      ? (activeLease.initial_rent + activeLease.charges) * 12
      : property.monthly_rent * 12;

    const annualRecurringExpenses =
      property.property_tax_annual +
      property.condo_fees_annual +
      property.insurance_annual +
      property.management_fees_annual +
      property.maintenance_annual +
      property.other_charges_annual;

    const propertyLoans = loanRows.filter((l) => l.property_id === property.id);
    const annualLoanInterestAndInsurance = propertyLoans.reduce(
      (sum, loan) => sum + annualInterestAndInsurance(loan, now),
      0
    );
    const totalAnnualLoanPayment = propertyLoans.reduce(
      (sum, loan) => sum + annualLoanPayment(loan),
      0
    );

    const totalProjectCost = calculateTotalProjectCost({
      purchasePrice: property.purchase_price ?? 0,
      notaryFees: property.notary_fees,
      agencyFees: property.agency_fees,
      worksBudget: property.works_budget,
      furnitureBudget: property.furniture_budget,
      otherFees: property.other_acquisition_fees,
    });

    return {
      property,
      totalProjectCost,
      annualRent,
      annualRecurringExpenses,
      annualLoanInterestAndInsurance,
      annualLoanPayment: totalAnnualLoanPayment,
      grossYield: calculateGrossYield({ annualRent, totalProjectCost }),
      netYield: calculateNetYield({
        annualRent,
        annualRecurringExpenses,
        totalProjectCost,
      }),
      netYieldAfterFinancing: calculateNetYieldAfterFinancing({
        annualRent,
        annualRecurringExpenses,
        annualLoanInterestAndInsurance,
        totalProjectCost,
      }),
      cashFlow: calculateCashFlow({
        rentCollected: annualRent,
        expenses: annualRecurringExpenses,
        loanPayment: totalAnnualLoanPayment,
      }),
    };
  });
}
