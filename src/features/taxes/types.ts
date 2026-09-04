import type { TaxEstimate, TaxRegime } from "@/lib/finance";

export type PropertyTaxBreakdown = {
  propertyId: string;
  propertyName: string;
  regime: TaxRegime | null;
  grossAnnualRent: number;
  ownCharges: number;
  otherExpenses: number;
  interest: number;
  deductibleExpenses: number;
  amortization: number;
  tmiRate: number;
  applySocialCharges: boolean;
  /** null tant qu'aucun régime fiscal n'est renseigné sur le bien. */
  estimate: TaxEstimate | null;
};
