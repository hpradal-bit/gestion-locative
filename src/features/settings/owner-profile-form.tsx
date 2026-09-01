"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { saveOwnerProfile } from "./actions";
import { tmiRates } from "./schema";

const TMI_LABELS: Record<(typeof tmiRates)[number], string> = {
  0: "0 % (non imposable)",
  0.11: "11 %",
  0.3: "30 %",
  0.41: "41 %",
  0.45: "45 %",
};

export function OwnerProfileForm({ profile }: { profile: Tables<"owner_profiles"> | null }) {
  const [state, formAction, pending] = useActionState(saveOwnerProfile, { error: null });

  React.useEffect(() => {
    if (state.success) {
      toast.success("Profil enregistré");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil propriétaire</CardTitle>
          <CardDescription>
            Ces informations apparaissent sur les documents générés (quittances).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" name="full_name" required defaultValue={profile?.full_name ?? ""} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={profile?.address ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input id="postal_code" name="postal_code" defaultValue={profile?.postal_code ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres fiscaux</CardTitle>
          <CardDescription>
            Utilisés pour estimer le cash-flow après impôt sur le dashboard et dans le simulateur.
            Ce sont des estimations, pas un calcul d&apos;impôt officiel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tmi_rate">Tranche marginale d&apos;imposition (TMI)</Label>
            <Select name="tmi_rate" defaultValue={String(profile?.tmi_rate ?? 0.3)}>
              <SelectTrigger id="tmi_rate" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tmiRates.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    {TMI_LABELS[rate]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label
            htmlFor="social_charges_applicable"
            className="flex items-center gap-2 rounded-md border p-3 font-normal"
          >
            <Checkbox
              id="social_charges_applicable"
              name="social_charges_applicable"
              defaultChecked={profile?.social_charges_applicable ?? true}
            />
            Soumis aux prélèvements sociaux (17,2 %)
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
          {pending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
