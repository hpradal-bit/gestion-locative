"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import { workStatuses } from "./schema";
import { WORK_STATUS_LABELS } from "./constants";
import type { WorkActionState } from "./actions";

type WorkFormProps = {
  properties: Tables<"properties">[];
  work?: Tables<"works">;
  action: (state: WorkActionState, formData: FormData) => Promise<WorkActionState>;
  submitLabel: string;
};

export function WorkForm({ properties, work, action, submitLabel }: WorkFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chantier</CardTitle>
          <CardDescription>
            Une fois le statut passé à « Terminé » ou « Payé » avec un montant réel, une dépense
            est générée automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="property_id">Bien</Label>
            <PropertySelector
              name="property_id"
              properties={properties}
              defaultValue={work?.property_id}
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              required
              defaultValue={work?.description}
              placeholder="Réfection de la toiture"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" name="company" defaultValue={work?.company ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Statut</Label>
            <Select name="status" defaultValue={work?.status ?? "a_prevoir"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {WORK_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quote_amount">Montant du devis</Label>
            <MoneyInput id="quote_amount" name="quote_amount" defaultValue={work?.quote_amount ?? 0} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimated_amount">Montant prévu</Label>
            <MoneyInput
              id="estimated_amount"
              name="estimated_amount"
              defaultValue={work?.estimated_amount ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="actual_amount">Montant réel</Label>
            <MoneyInput id="actual_amount" name="actual_amount" defaultValue={work?.actual_amount ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input id="start_date" name="start_date" type="date" defaultValue={work?.start_date ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="end_date">Date de fin</Label>
            <Input id="end_date" name="end_date" type="date" defaultValue={work?.end_date ?? ""} />
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
