"use client";

import type { SimulationInput } from "@/lib/finance";
import { taxRegimes } from "@/lib/finance/tax";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/shared/money-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TAX_REGIME_LABELS } from "@/features/properties/constants";

const TMI_OPTIONS = [0, 0.11, 0.3, 0.41, 0.45] as const;
const TMI_LABELS: Record<(typeof TMI_OPTIONS)[number], string> = {
  0: "0 % (non imposable)",
  0.11: "11 %",
  0.3: "30 %",
  0.41: "41 %",
  0.45: "45 %",
};

const NO_REGIME = "none";

type Field = keyof SimulationInput;
/** money()/number() ne sont jamais appelés qu'avec des champs numériques. */
type NumericField = Exclude<Field, "taxRegime" | "applySocialCharges">;

type ScenarioFormProps = {
  title: string;
  value: SimulationInput;
  onChange: (next: SimulationInput) => void;
  idPrefix: string;
};

export function ScenarioForm({ title, value, onChange, idPrefix }: ScenarioFormProps) {
  function set(field: NumericField, raw: string) {
    onChange({ ...value, [field]: Number(raw) || 0 });
  }

  function money(field: NumericField, label: string) {
    const id = `${idPrefix}-${field}`;
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <MoneyInput id={id} value={value[field]} onChange={(e) => set(field, e.target.value)} />
      </div>
    );
  }

  function number(field: NumericField, label: string, step = "1") {
    const id = `${idPrefix}-${field}`;
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="number"
          step={step}
          min={0}
          value={value[field]}
          onChange={(e) => set(field, e.target.value)}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Acquisition
          </p>
          <div className="grid grid-cols-2 gap-4">
            {money("purchasePrice", "Prix d'achat")}
            {money("notaryFees", "Frais de notaire")}
            {money("agencyFees", "Frais d'agence")}
            {money("worksBudget", "Travaux")}
            {money("furnitureBudget", "Mobilier")}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Financement
          </p>
          <div className="grid grid-cols-2 gap-4">
            {money("downPayment", "Apport")}
            {money("loanAmount", "Montant emprunté")}
            {number("annualInterestRate", "Taux annuel (%)", "0.01")}
            {number("durationMonths", "Durée (mois)")}
            {money("monthlyInsurance", "Assurance mensuelle")}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Location
          </p>
          <div className="grid grid-cols-2 gap-4">
            {money("monthlyRent", "Loyer mensuel")}
            {money("monthlyCharges", "Charges mensuelles")}
            {number("vacancyRate", "Vacance locative (%)")}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Dépenses annuelles
          </p>
          <div className="grid grid-cols-2 gap-4">
            {money("propertyTaxAnnual", "Taxe foncière")}
            {money("condoFeesAnnual", "Copropriété")}
            {money("insuranceAnnual", "Assurance")}
            {money("managementFeesAnnual", "Gestion")}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Fiscalité (estimation)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              <Label htmlFor={`${idPrefix}-taxRegime`}>Régime fiscal</Label>
              <Select
                value={value.taxRegime ?? NO_REGIME}
                onValueChange={(v) =>
                  onChange({ ...value, taxRegime: v === NO_REGIME ? null : (v as SimulationInput["taxRegime"]) })
                }
              >
                <SelectTrigger id={`${idPrefix}-taxRegime`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_REGIME}>Non renseigné</SelectItem>
                  {taxRegimes.map((regime) => (
                    <SelectItem key={regime} value={regime}>
                      {TAX_REGIME_LABELS[regime]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {value.taxRegime && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`${idPrefix}-tmiRate`}>TMI</Label>
                  <Select
                    value={String(value.tmiRate)}
                    onValueChange={(v) => onChange({ ...value, tmiRate: Number(v) })}
                  >
                    <SelectTrigger id={`${idPrefix}-tmiRate`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TMI_OPTIONS.map((rate) => (
                        <SelectItem key={rate} value={String(rate)}>
                          {TMI_LABELS[rate]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Label
                  htmlFor={`${idPrefix}-applySocialCharges`}
                  className="flex items-center gap-2 rounded-md border p-3 font-normal"
                >
                  <Checkbox
                    id={`${idPrefix}-applySocialCharges`}
                    checked={value.applySocialCharges}
                    onCheckedChange={(checked) =>
                      onChange({ ...value, applySocialCharges: checked === true })
                    }
                  />
                  Prélèvements sociaux (17,2 %)
                </Label>
                {value.taxRegime === "lmnp_reel" && money("annualAmortization", "Amortissement annuel estimé")}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
