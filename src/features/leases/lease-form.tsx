"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { leaseTypes, LEASE_TYPE_LABELS } from "./schema";
import type { LeaseActionState } from "./actions";

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

      <Card>
        <CardHeader>
          <CardTitle>Détails complémentaires (box, garage, parking)</CardTitle>
          <CardDescription>
            Utile pour un bail de box/garage — repris automatiquement dans les modèles de
            document. Laissez vide si non applicable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="keys_count">Nombre de clés</Label>
            <Input
              id="keys_count"
              name="keys_count"
              type="number"
              min={0}
              defaultValue={lease?.keys_count ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="badges_count">Nombre de badges</Label>
            <Input
              id="badges_count"
              name="badges_count"
              type="number"
              min={0}
              defaultValue={lease?.badges_count ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signature_city">Ville de signature</Label>
            <Input
              id="signature_city"
              name="signature_city"
              placeholder="ex : Paris"
              defaultValue={lease?.signature_city ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="authorized_use">Usage autorisé</Label>
            <Input
              id="authorized_use"
              name="authorized_use"
              placeholder="ex : le stationnement d'un véhicule"
              defaultValue={lease?.authorized_use ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment_method">Mode de paiement du loyer</Label>
            <Input
              id="payment_method"
              name="payment_method"
              placeholder="ex : virement bancaire"
              defaultValue={lease?.payment_method ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deposit_payment_method">Mode de versement du dépôt de garantie</Label>
            <Input
              id="deposit_payment_method"
              name="deposit_payment_method"
              placeholder="ex : virement bancaire"
              defaultValue={lease?.deposit_payment_method ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-3">
            <Label htmlFor="condition_at_handover">État du bien à la remise</Label>
            <Textarea
              id="condition_at_handover"
              name="condition_at_handover"
              placeholder="ex : bon état général, sol et murs en bon état, porte fonctionnelle"
              defaultValue={lease?.condition_at_handover ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-3">
            <Label htmlFor="charges_detail">Détail des charges</Label>
            <Textarea
              id="charges_detail"
              name="charges_detail"
              placeholder="ex : entretien du portail et de l'éclairage commun du parking"
              defaultValue={lease?.charges_detail ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-3">
            <Label htmlFor="sale_clause_reserve">Réserve du bailleur en cas de vente (optionnel)</Label>
            <Textarea
              id="sale_clause_reserve"
              name="sale_clause_reserve"
              placeholder="ex : le Bailleur ne se réserve aucun droit de résiliation anticipée en cas de vente"
              defaultValue={lease?.sale_clause_reserve ?? ""}
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
