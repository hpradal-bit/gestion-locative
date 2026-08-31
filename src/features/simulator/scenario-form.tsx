"use client";

import type { SimulationInput } from "@/lib/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/shared/money-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Field = keyof SimulationInput;

type ScenarioFormProps = {
  title: string;
  value: SimulationInput;
  onChange: (next: SimulationInput) => void;
  idPrefix: string;
};

export function ScenarioForm({ title, value, onChange, idPrefix }: ScenarioFormProps) {
  function set(field: Field, raw: string) {
    onChange({ ...value, [field]: Number(raw) || 0 });
  }

  function money(field: Field, label: string) {
    const id = `${idPrefix}-${field}`;
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <MoneyInput id={id} value={value[field]} onChange={(e) => set(field, e.target.value)} />
      </div>
    );
  }

  function number(field: Field, label: string, step = "1") {
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
      </CardContent>
    </Card>
  );
}
