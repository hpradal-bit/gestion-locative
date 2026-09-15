"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

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
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function LeaseReviewForm({
  leaseId,
  onSaved,
}: {
  leaseId: string;
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
          <Field id="owner_full_name" label="Nom complet">
            <Input id="owner_full_name" name="owner_full_name" defaultValue={data.owner.full_name} />
          </Field>
          <Field id="owner_email" label="Email">
            <Input id="owner_email" name="owner_email" type="email" defaultValue={data.owner.email} />
          </Field>
          <Field id="owner_phone" label="Téléphone">
            <Input id="owner_phone" name="owner_phone" defaultValue={data.owner.phone} />
          </Field>
          <Field id="owner_address" label="Adresse">
            <Input id="owner_address" name="owner_address" defaultValue={data.owner.address} />
          </Field>
          <Field id="owner_city" label="Ville">
            <Input id="owner_city" name="owner_city" defaultValue={data.owner.city} />
          </Field>
          <Field id="owner_postal_code" label="Code postal">
            <Input id="owner_postal_code" name="owner_postal_code" defaultValue={data.owner.postal_code} />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Locataire</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="tenant_first_name" label="Prénom">
            <Input id="tenant_first_name" name="tenant_first_name" defaultValue={data.tenant.first_name} required />
          </Field>
          <Field id="tenant_last_name" label="Nom">
            <Input id="tenant_last_name" name="tenant_last_name" defaultValue={data.tenant.last_name} required />
          </Field>
          <Field id="tenant_email" label="Email">
            <Input id="tenant_email" name="tenant_email" type="email" defaultValue={data.tenant.email} />
          </Field>
          <Field id="tenant_phone" label="Téléphone">
            <Input id="tenant_phone" name="tenant_phone" defaultValue={data.tenant.phone} />
          </Field>
          <Field id="tenant_address" label="Adresse">
            <Input id="tenant_address" name="tenant_address" defaultValue={data.tenant.address} />
          </Field>
          <Field id="tenant_birth_date" label="Date de naissance">
            <Input id="tenant_birth_date" name="tenant_birth_date" type="date" defaultValue={data.tenant.birth_date} />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Bien</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="property_name" label="Nom du bien">
            <Input id="property_name" name="property_name" defaultValue={data.property.name} required />
          </Field>
          <Field id="property_lot_number" label="Numéro de lot / box">
            <Input id="property_lot_number" name="property_lot_number" defaultValue={data.property.lot_number} />
          </Field>
          <Field id="property_address" label="Adresse">
            <Input id="property_address" name="property_address" defaultValue={data.property.address} />
          </Field>
          <Field id="property_city" label="Ville">
            <Input id="property_city" name="property_city" defaultValue={data.property.city} />
          </Field>
          <Field id="property_postal_code" label="Code postal">
            <Input id="property_postal_code" name="property_postal_code" defaultValue={data.property.postal_code} />
          </Field>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Bail</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="lease_start_date" label="Date de début">
            <Input id="lease_start_date" name="lease_start_date" type="date" defaultValue={data.lease.start_date} required />
          </Field>
          <Field id="lease_end_date" label="Date de fin">
            <Input id="lease_end_date" name="lease_end_date" type="date" defaultValue={data.lease.end_date} />
          </Field>
          <Field id="lease_lease_type" label="Type de bail">
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
          <Field id="lease_irl_index" label="Indice IRL / ICC">
            <Input id="lease_irl_index" name="lease_irl_index" defaultValue={data.lease.irl_index} />
          </Field>
          <Field id="lease_initial_rent" label="Loyer">
            <MoneyInput id="lease_initial_rent" name="lease_initial_rent" defaultValue={data.lease.initial_rent} />
          </Field>
          <Field id="lease_charges" label="Charges">
            <MoneyInput id="lease_charges" name="lease_charges" defaultValue={data.lease.charges} />
          </Field>
          <Field id="lease_security_deposit" label="Dépôt de garantie">
            <MoneyInput id="lease_security_deposit" name="lease_security_deposit" defaultValue={data.lease.security_deposit} />
          </Field>
          <Field id="lease_next_revision_date" label="Prochaine révision">
            <Input id="lease_next_revision_date" name="lease_next_revision_date" type="date" defaultValue={data.lease.next_revision_date} />
          </Field>
          <Field id="lease_payment_due_day" label="Jour de paiement du loyer">
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
          <Field id="lease_notice_period_months" label="Préavis de résiliation (mois)">
            <Input
              id="lease_notice_period_months"
              name="lease_notice_period_months"
              type="number"
              min={0}
              defaultValue={data.lease.notice_period_months}
              required
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
