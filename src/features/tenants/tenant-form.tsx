"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import type { TenantActionState } from "./actions";

type TenantFormProps = {
  tenant?: Tables<"tenants">;
  action: (state: TenantActionState, formData: FormData) => Promise<TenantActionState>;
  submitLabel: string;
};

export function TenantForm({ tenant, action, submitLabel }: TenantFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du locataire</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input id="first_name" name="first_name" required defaultValue={tenant?.first_name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input id="last_name" name="last_name" required defaultValue={tenant?.last_name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={tenant?.email ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={tenant?.phone ?? ""} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={tenant?.address ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="birth_date">Date de naissance</Label>
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={tenant?.birth_date ?? ""}
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
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
