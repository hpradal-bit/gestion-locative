import { createClient } from "@/lib/supabase/server";
import { calculateAmortizationSchedule, estimateTax, type TaxRegime } from "@/lib/finance";
import { monthsBetween } from "@/lib/date-utils";
import type { PropertyTaxBreakdown } from "./types";

/**
 * Détail fiscal de chaque bien, pour la page /impots — même logique que
 * l'estimation agrégée du dashboard (dashboard/queries.ts), mais bien par
 * bien et avec le détail des composantes (revenus, charges, intérêts).
 */
export async function getPropertyTaxBreakdowns(): Promise<PropertyTaxBreakdown[]> {
  const supabase = await createClient();
  const now = new Date();
  const historyStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: properties }, { data: leases }, { data: loans }, { data: expenses }, { data: ownerProfile }] =
    await Promise.all([
      supabase.from("properties").select("*").order("name"),
      supabase.from("leases").select("*").eq("status", "active"),
      supabase.from("loans").select("*"),
      supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", historyStart.toISOString().slice(0, 10)),
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

  return propertyRows.map((property) => {
    const ownCharges =
      property.property_tax_annual +
      property.condo_fees_annual +
      property.insurance_annual +
      property.management_fees_annual +
      property.maintenance_annual +
      property.other_charges_annual;
    const otherExpenses = expensesByProperty.get(property.id) ?? 0;
    const interest = interestByProperty.get(property.id) ?? 0;
    const deductibleExpenses = ownCharges + otherExpenses + interest;
    const grossAnnualRent = rentByProperty.get(property.id) ?? 0;
    const amortization = property.annual_amortization ?? 0;

    const estimate = property.tax_regime
      ? estimateTax({
          regime: property.tax_regime as TaxRegime,
          grossAnnualRent,
          deductibleExpenses,
          amortization,
          tmiRate,
          applySocialCharges,
        })
      : null;

    return {
      propertyId: property.id,
      propertyName: property.name,
      regime: (property.tax_regime as TaxRegime | null) ?? null,
      grossAnnualRent,
      ownCharges,
      otherExpenses,
      interest,
      deductibleExpenses,
      amortization,
      tmiRate,
      applySocialCharges,
      estimate,
    };
  });
}
