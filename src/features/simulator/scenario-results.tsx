import type { SimulationResult } from "@/lib/finance";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { RATING_BADGE_VARIANT, RATING_LABELS } from "./constants";

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={
          tone === "positive"
            ? "font-semibold text-success"
            : tone === "negative"
              ? "font-semibold text-destructive"
              : "font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function ScenarioResults({ result }: { result: SimulationResult }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Résultat</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">{result.score}/100</span>
          <Badge variant={RATING_BADGE_VARIANT[result.rating]}>
            {RATING_LABELS[result.rating]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Coût total" value={formatCurrency(result.totalProjectCost)} />
          <Metric label="Apport nécessaire" value={formatCurrency(result.downPaymentRequired)} />
          <Metric label="Mensualité" value={formatCurrency(result.monthlyPayment)} />
          <Metric label="Rentabilité brute" value={formatPercent(result.grossYield)} />
          <Metric label="Rentabilité nette" value={formatPercent(result.netYield)} />
          <Metric
            label="Rendement du capital investi"
            value={formatPercent(result.returnOnInvestment)}
          />
          <Metric
            label="Cash-flow mensuel"
            value={formatCurrency(result.cashFlowMonthly)}
            tone={result.cashFlowMonthly >= 0 ? "positive" : "negative"}
          />
          <Metric
            label="Cash-flow annuel"
            value={formatCurrency(result.cashFlowAnnual)}
            tone={result.cashFlowAnnual >= 0 ? "positive" : "negative"}
          />
          <Metric
            label="Effort d'épargne"
            value={formatCurrency(result.savingsEffort)}
            tone={result.savingsEffort > 0 ? "negative" : undefined}
          />
          {result.estimatedAnnualTax != null && (
            <>
              <Metric label="Impôt estimé (an)" value={formatCurrency(result.estimatedAnnualTax)} />
              <Metric
                label="Cash-flow mensuel après impôt"
                value={formatCurrency(result.cashFlowMonthlyAfterTax!)}
                tone={result.cashFlowMonthlyAfterTax! >= 0 ? "positive" : "negative"}
              />
              <Metric
                label="Cash-flow annuel après impôt"
                value={formatCurrency(result.cashFlowAnnualAfterTax!)}
                tone={result.cashFlowAnnualAfterTax! >= 0 ? "positive" : "negative"}
              />
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Le score est un indicateur d&apos;aide à la décision, pas une vérité financière absolue.
          {result.estimatedAnnualTax == null
            ? " Renseignez un régime fiscal pour estimer le cash-flow après impôt."
            : " La fiscalité est une estimation, pas un calcul d'impôt officiel."}
        </p>
      </CardContent>
    </Card>
  );
}
