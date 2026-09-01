"use client";

import * as React from "react";
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
import { leaseTypes } from "./schema";
import type { LeaseActionState } from "./actions";

const LEASE_TYPE_LABELS: Record<(typeof leaseTypes)[number], string> = {
  vide: "Location vide",
  meuble: "Location meublée",
  mobilite: "Bail mobilité",
  commercial: "Bail commercial",
  autre: "Autre",
};

type LeaseFormProps = {
  tenantId: string;
  properties: Tables<"properties">[];
  action: (state: LeaseActionState, formData: FormData) => Promise<LeaseActionState>;
  lease?: Tables<"leases">;
  submitLabel?: string;
};

export function LeaseForm({ tenantId, properties, action, lease, submitLabel }: LeaseFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [initialRent, setInitialRent] = React.useState(lease?.initial_rent ?? 0);
  const [charges, setCharges] = React.useState(lease?.charges ?? 0);
  // En édition, le loyer/charges viennent du bail existant : on ne veut pas
  // qu'un changement de bien dans le sélecteur les réinitialise depuis le
  // bien (comportement voulu uniquement à la création).
  const rentTouched = React.useRef(Boolean(lease));
  const chargesTouched = React.useRef(Boolean(lease));

  function handlePropertyChange(propertyId: string) {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;
    if (!rentTouched.current) setInitialRent(property.monthly_rent);
    if (!chargesTouched.current) setCharges(property.monthly_charges);
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <Card>
        <CardHeader>
          <CardTitle>Bail</CardTitle>
          <CardDescription>
            Le loyer et les charges se pré-remplissent depuis le bien choisi — modifiables si le
            bail diffère.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="property_id">Bien</Label>
            <PropertySelector
              name="property_id"
              properties={properties}
              defaultValue={lease?.property_id}
              onValueChange={handlePropertyChange}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={lease?.start_date ?? undefined}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="end_date">Date de fin (optionnelle)</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={lease?.end_date ?? undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lease_type">Type de bail</Label>
            <Select name="lease_type" defaultValue={lease?.lease_type ?? undefined}>
              <SelectTrigger id="lease_type" className="w-full">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {leaseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {LEASE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="irl_index">Indice IRL</Label>
            <Input
              id="irl_index"
              name="irl_index"
              placeholder="ex : 143,12"
              defaultValue={lease?.irl_index ?? undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="initial_rent">Loyer</Label>
            <MoneyInput
              id="initial_rent"
              name="initial_rent"
              value={initialRent}
              onChange={(e) => {
                rentTouched.current = true;
                setInitialRent(Number(e.target.value) || 0);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="charges">Charges</Label>
            <MoneyInput
              id="charges"
              name="charges"
              value={charges}
              onChange={(e) => {
                chargesTouched.current = true;
                setCharges(Number(e.target.value) || 0);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="security_deposit">Dépôt de garantie</Label>
            <MoneyInput
              id="security_deposit"
              name="security_deposit"
              defaultValue={lease?.security_deposit ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="next_revision_date">Prochaine révision</Label>
            <Input
              id="next_revision_date"
              name="next_revision_date"
              type="date"
              defaultValue={lease?.next_revision_date ?? undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment_due_day">Jour de paiement du loyer</Label>
            <Input
              id="payment_due_day"
              name="payment_due_day"
              type="number"
              min={1}
              max={31}
              defaultValue={lease?.payment_due_day ?? 1}
              required
            />
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
          {pending ? "Enregistrement..." : (submitLabel ?? "Créer le bail")}
        </Button>
      </div>
    </form>
  );
}
