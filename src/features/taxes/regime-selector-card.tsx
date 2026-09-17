"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { taxRegimes, type TaxRegime } from "@/lib/finance";
import type { PropertyTaxBreakdown } from "./types";
import { RegimeSquare } from "./regime-square";
import { NetCashLine } from "./net-cash-line";
import { setPropertyTaxRegime } from "./actions";

/**
 * Choix du régime fiscal d'un bien : cliquer sur une case l'enregistre
 * immédiatement. Le détail complet du régime choisi s'affiche en dessous.
 */
export function RegimeSelectorCard({ breakdown }: { breakdown: PropertyTaxBreakdown }) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingRegime, setPendingRegime] = React.useState<TaxRegime | null>(null);
  const cheapestTax = Math.min(...breakdown.simulations.map((s) => s.estimate.totalTax));
  const selected = breakdown.simulations.find((s) => s.regime === breakdown.regime);

  function handleSelect(regime: TaxRegime) {
    if (regime === breakdown.regime) return;
    setPendingRegime(regime);
    startTransition(async () => {
      const result = await setPropertyTaxRegime(breakdown.propertyId, regime);
      setPendingRegime(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Régime fiscal enregistré");
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{breakdown.propertyName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez sur un régime pour le retenir pour ce bien — il sera utilisé pour toutes vos
          estimations d&apos;impôt.
        </p>
        {breakdown.simulations.length < taxRegimes.length && (
          <p className="text-xs text-muted-foreground">
            Les régimes LMNP (location meublée) ne s&apos;appliquent pas à ce bien : un garage, un
            parking ou un local commercial n&apos;est pas un logement et ne peut pas être
            « meublé » au sens fiscal.
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {breakdown.simulations.map(({ regime, estimate }) => (
            <RegimeSquare
              key={regime}
              regime={regime}
              estimate={estimate}
              isCheapest={estimate.totalTax === cheapestTax}
              isSelected={breakdown.regime === regime}
              isActive={breakdown.regime === regime}
              disabled={isPending && pendingRegime === regime}
              onClick={() => handleSelect(regime)}
            />
          ))}
        </div>

        {selected ? (
          <div>
            <p className="mb-2 text-sm font-medium">
              Détail du calcul retenu — étape par étape
            </p>
            <ol className="flex flex-col gap-2 border-l pl-4">
              {selected.estimate.steps.map((step, index) => (
                <li key={index} className="text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{step.label}</span>
                    <span
                      className={
                        "shrink-0 font-medium tabular-nums " + (step.amount < 0 ? "text-destructive" : "")
                      }
                    >
                      {step.amount < 0 ? "− " : ""}
                      {formatCurrency(Math.abs(step.amount))}
                    </span>
                  </div>
                  {step.note && <p className="text-xs text-muted-foreground">{step.note}</p>}
                </li>
              ))}
            </ol>
            <div className="mt-3">
              <NetCashLine
                grossAnnualRent={breakdown.grossAnnualRent}
                chargesCollected={breakdown.chargesCollected}
                deductibleExpenses={breakdown.deductibleExpenses}
                estimate={selected.estimate}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun régime choisi pour l&apos;instant — cliquez sur une case ci-dessus.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
