import { calculateMonthlyPayment } from "./loan";
import {
  calculateCashFlow,
  calculateGrossYield,
  calculateNetYield,
  calculateReturnOnInvestment,
  calculateTotalProjectCost,
} from "./property";

export type SimulationInput = {
  purchasePrice: number;
  notaryFees: number;
  agencyFees: number;
  worksBudget: number;
  furnitureBudget: number;

  downPayment: number;
  loanAmount: number;
  annualInterestRate: number;
  durationMonths: number;
  monthlyInsurance: number;

  monthlyRent: number;
  monthlyCharges: number;
  /** Vacance locative, en % de l'année (0-100). */
  vacancyRate: number;

  propertyTaxAnnual: number;
  condoFeesAnnual: number;
  insuranceAnnual: number;
  managementFeesAnnual: number;
};

export type InvestmentRating = "excellent" | "bon" | "a_etudier" | "risque";

export type SimulationResult = {
  totalProjectCost: number;
  downPaymentRequired: number;
  monthlyPayment: number;
  grossYield: number;
  netYield: number;
  cashFlowMonthly: number;
  cashFlowAnnual: number;
  savingsEffort: number;
  returnOnInvestment: number;
  score: number;
  rating: InvestmentRating;
};

/**
 * Score d'aide à la décision (0-100), combinant rentabilité nette et
 * cash-flow. Ce n'est jamais une vérité financière absolue, seulement un
 * indicateur pour comparer rapidement plusieurs scénarios.
 */
export function calculateInvestmentScore({
  netYield,
  cashFlowMonthly,
}: {
  netYield: number;
  cashFlowMonthly: number;
}): number {
  // 10 % de rentabilité nette ou plus donne le score plein sur cet axe.
  const yieldScore = Math.min(Math.max(netYield / 10, 0), 1) * 70;
  // Cash-flow positif donne le score plein ; chaque -2 €/mois coûte 1 point.
  const cashFlowScore =
    cashFlowMonthly >= 0 ? 30 : Math.min(Math.max(30 + cashFlowMonthly / 2, 0), 30);

  return Math.round(yieldScore + cashFlowScore);
}

export function ratingFromScore(score: number): InvestmentRating {
  if (score >= 80) return "excellent";
  if (score >= 60) return "bon";
  if (score >= 40) return "a_etudier";
  return "risque";
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const totalProjectCost = calculateTotalProjectCost({
    purchasePrice: input.purchasePrice,
    notaryFees: input.notaryFees,
    agencyFees: input.agencyFees,
    worksBudget: input.worksBudget,
    furnitureBudget: input.furnitureBudget,
  });

  const monthlyPayment =
    calculateMonthlyPayment({
      principal: input.loanAmount,
      annualInterestRate: input.annualInterestRate,
      durationMonths: input.durationMonths,
    }) + input.monthlyInsurance;

  const nominalAnnualRent = (input.monthlyRent + input.monthlyCharges) * 12;
  const vacancyFactor = 1 - Math.min(Math.max(input.vacancyRate, 0), 100) / 100;
  const effectiveAnnualRent = nominalAnnualRent * vacancyFactor;

  const annualRecurringExpenses =
    input.propertyTaxAnnual +
    input.condoFeesAnnual +
    input.insuranceAnnual +
    input.managementFeesAnnual;

  const grossYield = calculateGrossYield({
    annualRent: nominalAnnualRent,
    totalProjectCost,
  });
  const netYield = calculateNetYield({
    annualRent: effectiveAnnualRent,
    annualRecurringExpenses,
    totalProjectCost,
  });

  const cashFlowMonthly = calculateCashFlow({
    rentCollected: effectiveAnnualRent / 12,
    expenses: annualRecurringExpenses / 12,
    loanPayment: monthlyPayment,
  });
  const cashFlowAnnual = cashFlowMonthly * 12;

  const returnOnInvestment = calculateReturnOnInvestment({
    annualCashFlow: cashFlowAnnual,
    downPayment: input.downPayment,
  });

  const score = calculateInvestmentScore({ netYield, cashFlowMonthly });

  return {
    totalProjectCost,
    downPaymentRequired: input.downPayment,
    monthlyPayment,
    grossYield,
    netYield,
    cashFlowMonthly,
    cashFlowAnnual,
    savingsEffort: Math.max(0, -cashFlowMonthly),
    returnOnInvestment,
    score,
    rating: ratingFromScore(score),
  };
}
