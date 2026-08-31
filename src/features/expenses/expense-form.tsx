"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoneyInput } from "@/components/shared/money-input";
import { PropertySelector } from "@/components/shared/property-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import { expenseCategories } from "./schema";
import { EXPENSE_CATEGORY_LABELS } from "./constants";
import type { ExpenseActionState } from "./actions";

type ExpenseFormProps = {
  properties: Tables<"properties">[];
  expense?: Tables<"expenses">;
  action: (state: ExpenseActionState, formData: FormData) => Promise<ExpenseActionState>;
  submitLabel: string;
};

export function ExpenseForm({ properties, expense, action, submitLabel }: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dépense</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="property_id">Bien</Label>
            <PropertySelector
              name="property_id"
              properties={properties}
              defaultValue={expense?.property_id}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select name="category" defaultValue={expense?.category}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {EXPENSE_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Montant</Label>
            <MoneyInput id="amount" name="amount" defaultValue={expense?.amount ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input
              id="expense_date"
              name="expense_date"
              type="date"
              required
              defaultValue={expense?.expense_date}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Input id="supplier" name="supplier" defaultValue={expense?.supplier ?? ""} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" defaultValue={expense?.description ?? ""} />
          </div>
          <Label
            htmlFor="is_recurring"
            className="flex items-center gap-2 rounded-md border p-3 font-normal sm:col-span-2 sm:w-fit"
          >
            <Checkbox id="is_recurring" name="is_recurring" defaultChecked={expense?.is_recurring} />
            Dépense récurrente
          </Label>
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
