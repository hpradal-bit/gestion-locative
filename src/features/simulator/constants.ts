import type { InvestmentRating, SimulationInput } from "@/lib/finance";

export const DEFAULT_SIMULATION_INPUT: SimulationInput = {
  purchasePrice: 200_000,
  notaryFees: 16_000,
  agencyFees: 0,
  worksBudget: 0,
  furnitureBudget: 0,

  downPayment: 20_000,
  loanAmount: 196_000,
  annualInterestRate: 3.5,
  durationMonths: 240,
  monthlyInsurance: 20,

  monthlyRent: 1_000,
  monthlyCharges: 100,
  vacancyRate: 0,

  propertyTaxAnnual: 900,
  condoFeesAnnual: 600,
  insuranceAnnual: 200,
  managementFeesAnnual: 0,

  taxRegime: null,
  tmiRate: 0.3,
  applySocialCharges: true,
  annualAmortization: 0,
};

export const RATING_LABELS: Record<InvestmentRating, string> = {
  excellent: "Excellent investissement",
  bon: "Bon investissement",
  a_etudier: "À étudier",
  risque: "Risqué",
};

export const RATING_BADGE_VARIANT: Record<
  InvestmentRating,
  "success" | "warning" | "destructive"
> = {
  excellent: "success",
  bon: "success",
  a_etudier: "warning",
  risque: "destructive",
};
