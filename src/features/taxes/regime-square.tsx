import { Check, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { TaxEstimate, TaxRegime } from "@/lib/finance";
import { taxRegimeLabels } from "@/lib/finance";

/** Une petite case cliquable par régime fiscal — comparaison (simulation) ou choix (sélection). */
export function RegimeSquare({
  regime,
  estimate,
  isCheapest,
  isSelected,
  isActive,
  disabled,
  onClick,
}: {
  regime: TaxRegime;
  estimate: TaxEstimate;
  /** Ce régime donne le montant le plus favorable parmi les 4 simulés. */
  isCheapest: boolean;
  /** Ce régime est celui actuellement choisi/enregistré sur le bien. */
  isSelected: boolean;
  /** Case actuellement mise en avant (survolée/dépliée), indépendant de la sélection. */
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const isSaving = estimate.totalTax < 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition disabled:cursor-wait disabled:opacity-70",
        isActive ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:border-primary/50 hover:bg-muted/40"
      )}
    >
      {isSelected && (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
      <p className="pr-6 text-xs font-medium leading-snug">{taxRegimeLabels[regime]}</p>
      <p className={cn("text-lg font-semibold tabular-nums", isSaving && "text-emerald-600 dark:text-emerald-400")}>
        {isSaving ? "− " : ""}
        {formatCurrency(Math.abs(estimate.totalTax))}
      </p>
      <p className="text-[11px] text-muted-foreground">
        {isSaving ? "économie d'impôt / an" : "d'impôt estimé / an"}
      </p>
      {isCheapest && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-3" />
          Le plus avantageux
        </span>
      )}
    </button>
  );
}
