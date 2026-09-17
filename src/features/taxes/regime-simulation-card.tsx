"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { taxRegimes } from "@/lib/finance";
import type { PropertyTaxBreakdown } from "./types";
import { RegimeSquare } from "./regime-square";
import { NetCashLine } from "./net-cash-line";

/**
 * Comparaison des régimes fiscaux applicables à un bien, avec ses revenus
 * et charges réels — purement informatif, la sélection se fait dans
 * l'onglet « Choisir le régime ».
 */
export function RegimeSimulationCard({ breakdown }: { breakdown: PropertyTaxBreakdown }) {
  const cheapestTax = Math.min(...breakdown.simulations.map((s) => s.estimate.totalTax));
  const [expandedRegime, setExpandedRegime] = React.useState(
    () => breakdown.simulations.find((s) => s.estimate.totalTax === cheapestTax)?.regime
  );
  const expanded = breakdown.simulations.find((s) => s.regime === expandedRegime);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{breakdown.propertyName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenus locatifs annuels retenus : {formatCurrency(breakdown.grossAnnualRent)} — charges et
          intérêts déductibles : {formatCurrency(breakdown.deductibleExpenses)}
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
              isActive={expandedRegime === regime}
              onClick={() => setExpandedRegime(regime)}
            />
          ))}
        </div>

        {expanded && (
          <div>
            <p className="mb-2 text-sm font-medium">Détail du calcul, étape par étape</p>
            <ol className="flex flex-col gap-2 border-l pl-4">
              {expanded.estimate.steps.map((step, index) => (
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
                estimate={expanded.estimate}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
