"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/shared/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { leaseTypes, LEASE_TYPE_LABELS } from "@/features/leases/schema";
import {
  getLeaseReviewData,
  saveLeaseReviewData,
  type LeaseReviewData,
} from "./lease-review-actions";

function Field({
  id,
  label,
  missing,
  children,
}: {
  id: string;
  label: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        missing
          ? "flex flex-col gap-1.5 rounded-md border-2 border-red-500 bg-red-50 p-2 dark:bg-red-950/40"
          : "flex flex-col gap-1.5"
      }
    >
      <Label htmlFor={id} className={missing ? "flex items-center gap-1 text-red-700 dark:text-red-400" : undefined}>
        {missing && <TriangleAlert className="size-3.5" />}
        {label}
        {missing && " — à compléter"}
      </Label>
      {children}
    </div>
  );
}

export function LeaseReviewForm({
  leaseId,
  missingFieldIds,
  onSaved,
}: {
  leaseId: string;
  missingFieldIds?: Set<string>;
  onSaved?: () => void;
}) {
  const [data, setData] = React.useState<LeaseReviewData | null>(null);
  const [isLoading, startLoadTransition] = React.useTransition();
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    startLoadTransition(async () => {
      const result = await getLeaseReviewData(leaseId);
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [leaseId, refreshKey]);

  const action = saveLeaseReviewData.bind(
    null,
    leaseId,
    data?.tenant.id ?? "",
    data?.property.id ?? ""
  );
  const [state, formAction, pending] = useActionState(action, { error: null });

  const wasSuccess = state.success;
  React.useEffect(() => {
    if (!wasSuccess) return;
    toast.success("Informations enregistrées");
    startLoadTransition(() => {
      setRefreshKey((k) => k + 1);
      onSaved?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasSuccess]);

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Chargement des informations…</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Propriétaire</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="owner_full_name" label="Nom complet" missing={missingFieldIds?.has("owner_full_name")}>
            <Input id="owner_full_name" name="owner_full_name" defaultValue={data.owner.full_name} />
          </Field>
          <Field id="owner_email" label="Email" missing={missingFieldIds?.has("owner_email")}>
            <Input id="owner_email" name="owner_email" type="email" defaultValue={data.owner.email} />
          </Field>
          <Field id="owner_phone" label="Téléphone" missing={missingFieldIds?.has("owner_phone")}>
            <Input id="owner_phone" name="owner_phone" defaultValue={data.owner.phone} />
          </Field>
          <Field id="owner_address" label="Adresse" missing={missingFieldIds?.has("owner_address")}>
            <Input id="owner_address" name="owner_address" defaultValue={data.owner.address} />
          </Field>
          <Field id="owner_city" label="Ville" missing={missingFieldIds?.has("owner_city")}>
            <Input id="owner_city" name="owner_city" defaultValue={data.owner.city} />
          </Field>
          <Field id="owner_postal_code" label="Code postal" missing={missingFieldIds?.has("owner_postal_code")}>
            <Input id="owner_postal_code" name="owner_postal_code" defaultValue={data.owner.postal_code} />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Locataire</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="tenant_first_name" label="Prénom" missing={missingFieldIds?.has("tenant_first_name")}>
            <Input id="tenant_first_name" name="tenant_first_name" defaultValue={data.tenant.first_name} required />
          </Field>
          <Field id="tenant_last_name" label="Nom" missing={missingFieldIds?.has("tenant_last_name")}>
            <Input id="tenant_last_name" name="tenant_last_name" defaultValue={data.tenant.last_name} required />
          </Field>
          <Field id="tenant_email" label="Email" missing={missingFieldIds?.has("tenant_email")}>
            <Input id="tenant_email" name="tenant_email" type="email" defaultValue={data.tenant.email} />
          </Field>
          <Field id="tenant_phone" label="Téléphone" missing={missingFieldIds?.has("tenant_phone")}>
            <Input id="tenant_phone" name="tenant_phone" defaultValue={data.tenant.phone} />
          </Field>
          <Field id="tenant_address" label="Adresse" missing={missingFieldIds?.has("tenant_address")}>
            <Input id="tenant_address" name="tenant_address" defaultValue={data.tenant.address} />
          </Field>
          <Field id="tenant_birth_date" label="Date de naissance" missing={missingFieldIds?.has("tenant_birth_date")}>
            <Input id="tenant_birth_date" name="tenant_birth_date" type="date" defaultValue={data.tenant.birth_date} />
          </Field>
          <Field id="tenant_birth_place" label="Lieu de naissance" missing={missingFieldIds?.has("tenant_birth_place")}>
            <Input id="tenant_birth_place" name="tenant_birth_place" placeholder="ex : Lyon (69)" defaultValue={data.tenant.birth_place} />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Bien</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="property_name" label="Nom du bien" missing={missingFieldIds?.has("property_name")}>
            <Input id="property_name" name="property_name" defaultValue={data.property.name} required />
          </Field>
          <Field id="property_lot_number" label="Numéro de lot / box" missing={missingFieldIds?.has("property_lot_number")}>
            <Input id="property_lot_number" name="property_lot_number" defaultValue={data.property.lot_number} />
          </Field>
          <Field id="property_address" label="Adresse" missing={missingFieldIds?.has("property_address")}>
            <Input id="property_address" name="property_address" defaultValue={data.property.address} />
          </Field>
          <Field id="property_city" label="Ville" missing={missingFieldIds?.has("property_city")}>
            <Input id="property_city" name="property_city" defaultValue={data.property.city} />
          </Field>
          <Field id="property_postal_code" label="Code postal" missing={missingFieldIds?.has("property_postal_code")}>
            <Input id="property_postal_code" name="property_postal_code" defaultValue={data.property.postal_code} />
          </Field>
          <Field id="property_building_level" label="Bâtiment / niveau" missing={missingFieldIds?.has("property_building_level")}>
            <Input
              id="property_building_level"
              name="property_building_level"
              placeholder="ex : Bâtiment B, niveau -1"
              defaultValue={data.property.building_level}
            />
          </Field>
          <Field id="property_surface_m2" label="Surface (m²)" missing={missingFieldIds?.has("property_surface_m2")}>
            <Input
              id="property_surface_m2"
              name="property_surface_m2"
              type="number"
              min={0}
              step="0.1"
              defaultValue={data.property.surface_m2 ?? ""}
            />
          </Field>
          <Field id="property_equipment" label="Équipements" missing={missingFieldIds?.has("property_equipment")}>
            <Input
              id="property_equipment"
              name="property_equipment"
              placeholder="ex : accès sécurisé, porte automatique"
              defaultValue={data.property.equipment}
            />
          </Field>
          <Field id="property_special_rule" label="Règle particulière de copropriété" missing={missingFieldIds?.has("property_special_rule")}>
            <Input
              id="property_special_rule"
              name="property_special_rule"
              placeholder="ex : accès interdit entre 23h et 6h sauf urgence"
              defaultValue={data.property.special_rule}
            />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Bail</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="lease_start_date" label="Date de début" missing={missingFieldIds?.has("lease_start_date")}>
            <Input id="lease_start_date" name="lease_start_date" type="date" defaultValue={data.lease.start_date} required />
          </Field>
          <Field id="lease_end_date" label="Date de fin" missing={missingFieldIds?.has("lease_end_date")}>
            <Input id="lease_end_date" name="lease_end_date" type="date" defaultValue={data.lease.end_date} />
          </Field>
          <Field id="lease_lease_type" label="Type de bail" missing={missingFieldIds?.has("lease_lease_type")}>
            <Select name="lease_lease_type" defaultValue={data.lease.lease_type || undefined}>
              <SelectTrigger id="lease_lease_type" className="w-full">
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
          </Field>
          <Field id="lease_irl_index" label="Indice IRL / ICC" missing={missingFieldIds?.has("lease_irl_index")}>
            <Input id="lease_irl_index" name="lease_irl_index" defaultValue={data.lease.irl_index} />
          </Field>
          <Field id="lease_initial_rent" label="Loyer" missing={missingFieldIds?.has("lease_initial_rent")}>
            <MoneyInput id="lease_initial_rent" name="lease_initial_rent" defaultValue={data.lease.initial_rent} />
          </Field>
          <Field id="lease_charges" label="Charges" missing={missingFieldIds?.has("lease_charges")}>
            <MoneyInput id="lease_charges" name="lease_charges" defaultValue={data.lease.charges} />
          </Field>
          <Field id="lease_security_deposit" label="Dépôt de garantie" missing={missingFieldIds?.has("lease_security_deposit")}>
            <MoneyInput id="lease_security_deposit" name="lease_security_deposit" defaultValue={data.lease.security_deposit} />
          </Field>
          <Field id="lease_next_revision_date" label="Prochaine révision" missing={missingFieldIds?.has("lease_next_revision_date")}>
            <Input id="lease_next_revision_date" name="lease_next_revision_date" type="date" defaultValue={data.lease.next_revision_date} />
          </Field>
          <Field id="lease_payment_due_day" label="Jour de paiement du loyer" missing={missingFieldIds?.has("lease_payment_due_day")}>
            <Input
              id="lease_payment_due_day"
              name="lease_payment_due_day"
              type="number"
              min={1}
              max={31}
              defaultValue={data.lease.payment_due_day}
              required
            />
          </Field>
          <Field id="lease_notice_period_months" label="Préavis de résiliation (mois)" missing={missingFieldIds?.has("lease_notice_period_months")}>
            <Input
              id="lease_notice_period_months"
              name="lease_notice_period_months"
              type="number"
              min={0}
              defaultValue={data.lease.notice_period_months}
              required
            />
          </Field>
          <Field id="lease_keys_count" label="Nombre de clés" missing={missingFieldIds?.has("lease_keys_count")}>
            <Input id="lease_keys_count" name="lease_keys_count" type="number" min={0} defaultValue={data.lease.keys_count ?? ""} />
          </Field>
          <Field id="lease_badges_count" label="Nombre de badges" missing={missingFieldIds?.has("lease_badges_count")}>
            <Input id="lease_badges_count" name="lease_badges_count" type="number" min={0} defaultValue={data.lease.badges_count ?? ""} />
          </Field>
          <Field id="lease_signature_city" label="Ville de signature" missing={missingFieldIds?.has("lease_signature_city")}>
            <Input id="lease_signature_city" name="lease_signature_city" placeholder="ex : Paris" defaultValue={data.lease.signature_city} />
          </Field>
          <Field id="lease_authorized_use" label="Usage autorisé" missing={missingFieldIds?.has("lease_authorized_use")}>
            <Input
              id="lease_authorized_use"
              name="lease_authorized_use"
              placeholder="ex : le stationnement d'un véhicule"
              defaultValue={data.lease.authorized_use}
            />
          </Field>
          <Field id="lease_payment_method" label="Mode de paiement du loyer" missing={missingFieldIds?.has("lease_payment_method")}>
            <Input
              id="lease_payment_method"
              name="lease_payment_method"
              placeholder="ex : virement bancaire"
              defaultValue={data.lease.payment_method}
            />
          </Field>
          <Field id="lease_deposit_payment_method" label="Mode de versement du dépôt" missing={missingFieldIds?.has("lease_deposit_payment_method")}>
            <Input
              id="lease_deposit_payment_method"
              name="lease_deposit_payment_method"
              placeholder="ex : virement bancaire"
              defaultValue={data.lease.deposit_payment_method}
            />
          </Field>
          <Field id="lease_condition_at_handover" label="État du bien à la remise" missing={missingFieldIds?.has("lease_condition_at_handover")}>
            <Input
              id="lease_condition_at_handover"
              name="lease_condition_at_handover"
              placeholder="ex : bon état général, porte fonctionnelle"
              defaultValue={data.lease.condition_at_handover}
            />
          </Field>
          <Field id="lease_charges_detail" label="Détail des charges" missing={missingFieldIds?.has("lease_charges_detail")}>
            <Input
              id="lease_charges_detail"
              name="lease_charges_detail"
              placeholder="ex : entretien du portail et de l'éclairage commun"
              defaultValue={data.lease.charges_detail}
            />
          </Field>
          <Field id="lease_sale_clause_reserve" label="Réserve en cas de vente (facultatif)" missing={missingFieldIds?.has("lease_sale_clause_reserve")}>
            <Input
              id="lease_sale_clause_reserve"
              name="lease_sale_clause_reserve"
              placeholder="ex : aucun droit de résiliation anticipée en cas de vente"
              defaultValue={data.lease.sale_clause_reserve}
            />
          </Field>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
