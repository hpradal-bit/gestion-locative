import type { TaxEstimate, TaxRegime } from "@/lib/finance";

export type PropertyTaxBreakdown = {
  propertyId: string;
  propertyName: string;
  propertyType: string | null;
  regime: TaxRegime | null;
  grossAnnualRent: number;
  /** Provisions pour charges locatives refacturées au locataire selon sa consommation — jamais un revenu réel. */
  chargesCollected: number;
  ownCharges: number;
  otherExpenses: number;
  interest: number;
  deductibleExpenses: number;
  amortization: number;
  tmiRate: number;
  applySocialCharges: boolean;
  /** null tant qu'aucun régime fiscal n'est renseigné sur le bien. */
  estimate: TaxEstimate | null;
  /** Simulation des régimes légalement applicables à ce type de bien, avec ses données réelles. */
  simulations: { regime: TaxRegime; estimate: TaxEstimate }[];
};
