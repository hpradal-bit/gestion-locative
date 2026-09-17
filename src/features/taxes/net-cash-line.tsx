import { Wallet } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { TaxEstimate } from "@/lib/finance";

/**
 * Ligne de synthèse finale : ce qu'il reste réellement dans la poche du
 * propriétaire une fois les charges déductibles et l'impôt payés — par an
 * et par mois, sur la même ligne, pour une lecture immédiate.
 */
export function NetCashLine({
  grossAnnualRent,
  deductibleExpenses,
  estimate,
}: {
  grossAnnualRent: number;
  deductibleExpenses: number;
  estimate: TaxEstimate;
}) {
  const netAnnual = grossAnnualRent - deductibleExpenses - estimate.totalTax;
  const netMonthly = netAnnual / 12;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Wallet className="size-4" />
        Dans votre poche, après charges et impôt
      </span>
      <span className="shrink-0 tabular-nums">
        <span className="text-lg font-semibold">{formatCurrency(netAnnual)}</span>
        <span className="text-sm text-muted-foreground"> /an</span>
        <span className="mx-1.5 text-muted-foreground">—</span>
        <span className="text-lg font-semibold">{formatCurrency(netMonthly)}</span>
        <span className="text-sm text-muted-foreground"> /mois</span>
      </span>
    </div>
  );
}
