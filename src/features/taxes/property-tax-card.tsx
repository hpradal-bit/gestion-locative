import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taxRegimeLabels } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import type { PropertyTaxBreakdown } from "./types";

function SummaryItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PropertyTaxCard({ breakdown }: { breakdown: PropertyTaxBreakdown }) {
  if (!breakdown.regime || !breakdown.estimate) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>{breakdown.propertyName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Aucun régime fiscal renseigné pour ce bien : impossible d&apos;estimer l&apos;impôt.
          </p>
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link href={`/biens/${breakdown.propertyId}/modifier`}>Renseigner un régime fiscal</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { estimate } = breakdown;
  const isDeficit = estimate.taxableIncome === 0 && estimate.incomeTaxSavingFromDeficit > 0;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{breakdown.propertyName}</CardTitle>
        <Badge variant="secondary">{taxRegimeLabels[breakdown.regime]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SummaryItem label="Revenus locatifs pris en compte" value={formatCurrency(breakdown.grossAnnualRent)} />
          <SummaryItem
            label="Charges & dépenses déductibles"
            value={formatCurrency(breakdown.ownCharges + breakdown.otherExpenses)}
            hint="Charges du bien + dépenses enregistrées"
          />
          <SummaryItem label="Intérêts d'emprunt" value={formatCurrency(breakdown.interest)} />
          <SummaryItem
            label={isDeficit ? "Déficit foncier" : "Résultat / bénéfice imposable"}
            value={
              isDeficit
                ? formatCurrency(breakdown.deductibleExpenses - breakdown.grossAnnualRent)
                : formatCurrency(estimate.taxableIncome)
            }
          />
          <SummaryItem
            label="Impôt estimé (IR + prélèvements sociaux)"
            value={formatCurrency(estimate.totalTax)}
            hint={estimate.totalTax < 0 ? "Négatif = économie d'impôt" : undefined}
          />
          {estimate.deficitCarriedForwardOnFonciers > 0 && (
            <SummaryItem
              label="Déficit reporté (10 ans, revenus fonciers)"
              value={formatCurrency(estimate.deficitCarriedForwardOnFonciers)}
            />
          )}
          {estimate.carriedForwardAmortization > 0 && (
            <SummaryItem
              label="Amortissement reporté (sans limite de temps)"
              value={formatCurrency(estimate.carriedForwardAmortization)}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Détail du calcul, étape par étape</p>
          <ol className="flex flex-col gap-2 border-l pl-4">
            {estimate.steps.map((step, index) => (
              <li key={index} className="text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <span>{step.label}</span>
                  <span
                    className={
                      "shrink-0 font-medium tabular-nums " +
                      (step.amount < 0 ? "text-destructive" : "")
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
        </div>
      </CardContent>
    </Card>
  );
}
