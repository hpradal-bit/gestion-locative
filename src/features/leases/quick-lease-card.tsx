"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertySelector } from "@/components/shared/property-selector";
import { TenantSelector } from "@/components/shared/tenant-selector";
import { formatCurrency } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";
import { quickCreateLease } from "./actions";

type QuickLeaseCardProps = {
  properties: Tables<"properties">[];
  tenants: Pick<Tables<"tenants">, "id" | "first_name" | "last_name">[];
};

export function QuickLeaseCard({ properties, tenants }: QuickLeaseCardProps) {
  const [state, formAction, pending] = useActionState(quickCreateLease, { error: null });
  const [propertyId, setPropertyId] = React.useState<string | undefined>(undefined);
  const formRef = React.useRef<HTMLFormElement>(null);

  const selectedProperty = properties.find((p) => p.id === propertyId);

  React.useEffect(() => {
    if (!state.success) return;
    toast.success("Bail créé — échéances générées pour les 12 prochains mois.");
    formRef.current?.reset();
    const id = setTimeout(() => setPropertyId(undefined), 0);
    return () => clearTimeout(id);
  }, [state]);

  function reset() {
    formRef.current?.reset();
    setPropertyId(undefined);
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Nouveau bail</CardTitle>
        <CardDescription>Enregistrez un locataire et son loyer en une fois.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Bien</Label>
            <PropertySelector
              name="property_id"
              properties={properties}
              onValueChange={setPropertyId}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Locataire</Label>
            <TenantSelector name="tenant_id" tenants={tenants} required />
          </div>

          {selectedProperty && (
            <p className="text-xs text-muted-foreground">
              Loyer repris du bien :{" "}
              {formatCurrency(selectedProperty.monthly_rent + selectedProperty.monthly_charges)} /
              mois — modifiable ensuite depuis le bail.
            </p>
          )}

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="rounded-full">
              {pending ? "Création..." : "Créer le bail"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={reset}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
