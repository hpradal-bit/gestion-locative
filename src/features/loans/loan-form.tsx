"use client";

import * as React from "react";
import { useActionState } from "react";

import { calculateMonthlyPayment } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/shared/money-input";
import { PropertySelector } from "@/components/shared/property-selector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import type { LoanActionState } from "./actions";

type LoanFormProps = {
  properties: Tables<"properties">[];
  loan?: Tables<"loans">;
  action: (state: LoanActionState, formData: FormData) => Promise<LoanActionState>;
  submitLabel: string;
};

export function LoanForm({ properties, loan, action, submitLabel }: LoanFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [initialAmount, setInitialAmount] = React.useState(loan?.initial_amount ?? 0);
  const [rate, setRate] = React.useState(loan?.annual_interest_rate ?? 0);
  const [duration, setDuration] = React.useState(loan?.duration_months ?? 240);
  const [insurance, setInsurance] = React.useState(loan?.monthly_insurance ?? 0);

  const monthlyPayment = calculateMonthlyPayment({
    principal: initialAmount,
    annualInterestRate: rate,
    durationMonths: duration,
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Financement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="property_id">Bien</Label>
            <PropertySelector
              name="property_id"
              properties={properties}
              defaultValue={loan?.property_id}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="initial_amount">Montant emprunté</Label>
            <MoneyInput
              id="initial_amount"
              name="initial_amount"
              defaultValue={loan?.initial_amount ?? ""}
              onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="down_payment">Apport</Label>
            <MoneyInput id="down_payment" name="down_payment" defaultValue={loan?.down_payment ?? 0} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="annual_interest_rate">Taux annuel (%)</Label>
            <Input
              id="annual_interest_rate"
              name="annual_interest_rate"
              type="number"
              step="0.01"
              min={0}
              defaultValue={loan?.annual_interest_rate ?? ""}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="duration_months">Durée (mois)</Label>
            <Input
              id="duration_months"
              name="duration_months"
              type="number"
              min={1}
              defaultValue={loan?.duration_months ?? 240}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_insurance">Assurance mensuelle</Label>
            <MoneyInput
              id="monthly_insurance"
              name="monthly_insurance"
              defaultValue={loan?.monthly_insurance ?? 0}
              onChange={(e) => setInsurance(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={loan?.start_date ?? ""}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4 sm:col-span-2">
            <span className="text-sm font-medium">Mensualité (assurance incluse)</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(monthlyPayment + insurance)}
            </span>
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
