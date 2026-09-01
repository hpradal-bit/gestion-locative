export type TotalProjectCostInput = {
  purchasePrice: number;
  notaryFees?: number;
  agencyFees?: number;
  worksBudget?: number;
  furnitureBudget?: number;
  otherFees?: number;
};

/** Coût total du projet = tout ce qui a été nécessaire pour acquérir et rendre le bien louable. */
export function calculateTotalProjectCost({
  purchasePrice,
  notaryFees = 0,
  agencyFees = 0,
  worksBudget = 0,
  furnitureBudget = 0,
  otherFees = 0,
}: TotalProjectCostInput): number {
  return (
    purchasePrice +
    notaryFees +
    agencyFees +
    worksBudget +
    furnitureBudget +
    otherFees
  );
}

function safeRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

/** Rentabilité brute = loyers annuels / coût total du projet. */
export function calculateGrossYield(input: {
  annualRent: number;
  totalProjectCost: number;
}): number {
  return safeRatio(input.annualRent, input.totalProjectCost);
}

/** Rentabilité nette = (loyers annuels - dépenses récurrentes) / coût total du projet. */
export function calculateNetYield(input: {
  annualRent: number;
  annualRecurringExpenses: number;
  totalProjectCost: number;
}): number {
  return safeRatio(
    input.annualRent - input.annualRecurringExpenses,
    input.totalProjectCost
  );
}

/**
 * Rentabilité nette après financement : intègre en plus le coût annuel du
 * crédit (intérêts + assurance), hors remboursement de capital — le capital
 * remboursé n'est pas une charge, c'est de l'épargne forcée.
 */
export function calculateNetYieldAfterFinancing(input: {
  annualRent: number;
  annualRecurringExpenses: number;
  annualLoanInterestAndInsurance: number;
  totalProjectCost: number;
}): number {
  return safeRatio(
    input.annualRent -
      input.annualRecurringExpenses -
      input.annualLoanInterestAndInsurance,
    input.totalProjectCost
  );
}

/** Cash-flow = revenus locatifs encaissés - dépenses - mensualité de crédit (capital + intérêts + assurance). */
export function calculateCashFlow(input: {
  rentCollected: number;
  expenses: number;
  loanPayment: number;
}): number {
  return input.rentCollected - input.expenses - input.loanPayment;
}

/** Rendement du capital investi (cash-on-cash) = cash-flow annuel / apport. */
export function calculateReturnOnInvestment(input: {
  annualCashFlow: number;
  downPayment: number;
}): number {
  return safeRatio(input.annualCashFlow, input.downPayment);
}

/**
 * Plus-value potentielle = valorisation actuelle - prix d'achat.
 * Volontairement distinct du coût total du projet (qui inclut frais/travaux) :
 * c'est la plus-value patrimoniale brute, pas la rentabilité de l'opération.
 * Retourne `null` tant que la valorisation actuelle n'a pas été renseignée —
 * jamais une valeur calculée à partir d'une hypothèse implicite.
 */
export function calculateCapitalGain(input: {
  purchasePrice: number | null;
  currentValue: number | null;
}): number | null {
  if (input.currentValue == null || input.purchasePrice == null) return null;
  return input.currentValue - input.purchasePrice;
}
