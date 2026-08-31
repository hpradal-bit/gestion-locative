export type MonthlyPaymentInput = {
  /** Montant emprunté (hors assurance), en euros. */
  principal: number;
  /** Taux d'intérêt annuel, en pourcentage (ex : 3.2 pour 3,2 %). */
  annualInterestRate: number;
  durationMonths: number;
};

/**
 * Mensualité de remboursement du capital + intérêts (hors assurance), formule
 * d'annuité constante. L'assurance est ajoutée séparément par l'appelant
 * (elle ne compose pas avec le taux du crédit).
 */
export function calculateMonthlyPayment({
  principal,
  annualInterestRate,
  durationMonths,
}: MonthlyPaymentInput): number {
  if (durationMonths <= 0 || principal <= 0) return 0;

  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / durationMonths;
  }

  const factor = Math.pow(1 + monthlyRate, durationMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export type RemainingPrincipalInput = {
  principal: number;
  annualInterestRate: number;
  durationMonths: number;
  /** Nombre de mensualités déjà versées. */
  monthsElapsed: number;
};

/** Capital restant dû après `monthsElapsed` mensualités versées. */
export function calculateRemainingPrincipal({
  principal,
  annualInterestRate,
  durationMonths,
  monthsElapsed,
}: RemainingPrincipalInput): number {
  if (principal <= 0 || durationMonths <= 0) return 0;
  if (monthsElapsed <= 0) return principal;
  if (monthsElapsed >= durationMonths) return 0;

  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal * (1 - monthsElapsed / durationMonths);
  }

  const growthTotal = Math.pow(1 + monthlyRate, durationMonths);
  const growthElapsed = Math.pow(1 + monthlyRate, monthsElapsed);

  const remaining =
    (principal * (growthTotal - growthElapsed)) / (growthTotal - 1);

  return Math.max(0, remaining);
}

export type AmortizationRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingPrincipal: number;
};

/** Tableau d'amortissement mois par mois (mensualité hors assurance). */
export function calculateAmortizationSchedule({
  principal,
  annualInterestRate,
  durationMonths,
}: MonthlyPaymentInput): AmortizationRow[] {
  if (principal <= 0 || durationMonths <= 0) return [];

  const monthlyRate = annualInterestRate / 100 / 12;
  const payment = calculateMonthlyPayment({ principal, annualInterestRate, durationMonths });

  const rows: AmortizationRow[] = [];
  let remaining = principal;

  for (let month = 1; month <= durationMonths; month++) {
    const interest = remaining * monthlyRate;
    const principalPortion = Math.min(payment - interest, remaining);
    remaining = Math.max(0, remaining - principalPortion);

    rows.push({
      month,
      payment: principalPortion + interest,
      interest,
      principal: principalPortion,
      remainingPrincipal: remaining,
    });
  }

  return rows;
}
