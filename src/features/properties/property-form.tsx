"use client";

import * as React from "react";
import { useActionState } from "react";

import { calculateGrossYield, calculateTotalProjectCost } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoneyInput } from "@/components/shared/money-input";
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
import { PROPERTY_TYPE_LABELS, TAX_REGIME_LABELS } from "./constants";
import { propertyTypes } from "./schema";
import { taxRegimes } from "@/lib/finance/tax";
import type { PropertyActionState } from "./actions";

type PropertyFormProps = {
  property?: Tables<"properties">;
  action: (
    state: PropertyActionState,
    formData: FormData
  ) => Promise<PropertyActionState>;
  submitLabel: string;
};

export function PropertyForm({ property, action, submitLabel }: PropertyFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [purchasePrice, setPurchasePrice] = React.useState(
    property?.purchase_price ?? 0
  );
  const [notaryFees, setNotaryFees] = React.useState(property?.notary_fees ?? 0);
  const [agencyFees, setAgencyFees] = React.useState(property?.agency_fees ?? 0);
  const [worksBudget, setWorksBudget] = React.useState(property?.works_budget ?? 0);
  const [furnitureBudget, setFurnitureBudget] = React.useState(
    property?.furniture_budget ?? 0
  );
  const [otherFees, setOtherFees] = React.useState(
    property?.other_acquisition_fees ?? 0
  );
  const [monthlyRent, setMonthlyRent] = React.useState(property?.monthly_rent ?? 0);
  const [taxRegime, setTaxRegime] = React.useState(property?.tax_regime ?? "");

  const totalProjectCost = calculateTotalProjectCost({
    purchasePrice,
    notaryFees,
    agencyFees,
    worksBudget,
    furnitureBudget,
    otherFees,
  });
  const estimatedGrossYield = calculateGrossYield({
    annualRent: monthlyRent * 12,
    totalProjectCost,
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Identité et caractéristiques du bien.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="name">Nom du bien</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={property?.name}
              placeholder="Appartement Paris 11e"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={property?.address ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" name="city" defaultValue={property?.city ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={property?.postal_code ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="property_type">Type</Label>
            <Select name="property_type" defaultValue={property?.property_type ?? undefined}>
              <SelectTrigger id="property_type" className="w-full">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {PROPERTY_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="surface_m2">Surface (m²)</Label>
            <Input
              id="surface_m2"
              name="surface_m2"
              type="number"
              min={0}
              step="0.1"
              defaultValue={property?.surface_m2 ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rooms">Nombre de pièces</Label>
            <Input
              id="rooms"
              name="rooms"
              type="number"
              min={0}
              defaultValue={property?.rooms ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="floor">Étage</Label>
            <Input
              id="floor"
              name="floor"
              type="number"
              defaultValue={property?.floor ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            {[
              { id: "has_elevator", label: "Ascenseur", value: property?.has_elevator },
              { id: "has_parking", label: "Parking", value: property?.has_parking },
              { id: "has_cellar", label: "Cave", value: property?.has_cellar },
              { id: "has_balcony", label: "Balcon", value: property?.has_balcony },
              { id: "is_furnished", label: "Meublé", value: property?.is_furnished },
            ].map((item) => (
              <Label
                key={item.id}
                htmlFor={item.id}
                className="flex items-center gap-2 rounded-md border p-3 font-normal"
              >
                <Checkbox id={item.id} name={item.id} defaultChecked={item.value} />
                {item.label}
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acquisition</CardTitle>
          <CardDescription>
            Prix, frais et travaux — le coût total du projet est calculé automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="purchase_price">Prix d&apos;achat</Label>
            <MoneyInput
              id="purchase_price"
              name="purchase_price"
              defaultValue={property?.purchase_price ?? ""}
              onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="purchase_date">Date d&apos;achat</Label>
            <Input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={property?.purchase_date ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notary_fees">Frais de notaire</Label>
            <MoneyInput
              id="notary_fees"
              name="notary_fees"
              defaultValue={property?.notary_fees ?? 0}
              onChange={(e) => setNotaryFees(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="agency_fees">Frais d&apos;agence</Label>
            <MoneyInput
              id="agency_fees"
              name="agency_fees"
              defaultValue={property?.agency_fees ?? 0}
              onChange={(e) => setAgencyFees(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="works_budget">Montant des travaux</Label>
            <MoneyInput
              id="works_budget"
              name="works_budget"
              defaultValue={property?.works_budget ?? 0}
              onChange={(e) => setWorksBudget(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="furniture_budget">Montant du mobilier</Label>
            <MoneyInput
              id="furniture_budget"
              name="furniture_budget"
              defaultValue={property?.furniture_budget ?? 0}
              onChange={(e) => setFurnitureBudget(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="other_acquisition_fees">Autres frais</Label>
            <MoneyInput
              id="other_acquisition_fees"
              name="other_acquisition_fees"
              defaultValue={property?.other_acquisition_fees ?? 0}
              onChange={(e) => setOtherFees(Number(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4 sm:col-span-2">
            <span className="text-sm font-medium">Coût total du projet</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalProjectCost)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valorisation actuelle</CardTitle>
          <CardDescription>
            Estimation indépendante du prix d&apos;achat — sert au calcul de la plus-value. Laissez
            vide si vous ne l&apos;avez pas encore estimée : le prix d&apos;achat sera utilisé par
            défaut.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current_value">Valorisation estimée</Label>
            <MoneyInput
              id="current_value"
              name="current_value"
              defaultValue={property?.current_value ?? ""}
            />
          </div>
          {property?.current_value_updated_at && (
            <div className="flex flex-col justify-end pb-2 text-sm text-muted-foreground">
              Dernière mise à jour :{" "}
              {new Date(property.current_value_updated_at).toLocaleDateString("fr-FR")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiscalité</CardTitle>
          <CardDescription>
            Utilisé pour estimer le cash-flow après impôt de ce bien. Laissez vide si vous ne
            savez pas encore — le cash-flow restera affiché avant impôt.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tax_regime">Régime fiscal</Label>
            <Select name="tax_regime" value={taxRegime} onValueChange={setTaxRegime}>
              <SelectTrigger id="tax_regime" className="w-full">
                <SelectValue placeholder="Non renseigné" />
              </SelectTrigger>
              <SelectContent>
                {taxRegimes.map((regime) => (
                  <SelectItem key={regime} value={regime}>
                    {TAX_REGIME_LABELS[regime]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {taxRegime === "lmnp_reel" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="annual_amortization">Amortissement annuel estimé</Label>
              <MoneyInput
                id="annual_amortization"
                name="annual_amortization"
                defaultValue={property?.annual_amortization ?? ""}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Loyer cible et date de mise en location.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_rent">Loyer mensuel (hors charges)</Label>
            <MoneyInput
              id="monthly_rent"
              name="monthly_rent"
              defaultValue={property?.monthly_rent ?? 0}
              onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_charges">Charges mensuelles</Label>
            <MoneyInput
              id="monthly_charges"
              name="monthly_charges"
              defaultValue={property?.monthly_charges ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="rental_start_date">Date de mise en location</Label>
            <Input
              id="rental_start_date"
              name="rental_start_date"
              type="date"
              defaultValue={property?.rental_start_date ?? ""}
            />
          </div>

          {monthlyRent > 0 && totalProjectCost > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4 sm:col-span-2">
              <span className="text-sm font-medium">Rentabilité brute estimée</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatPercent(estimatedGrossYield)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charges annuelles</CardTitle>
          <CardDescription>
            Utilisées pour calculer la rentabilité nette de ce bien.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="property_tax_annual">Taxe foncière (annuelle)</Label>
            <MoneyInput
              id="property_tax_annual"
              name="property_tax_annual"
              defaultValue={property?.property_tax_annual ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="condo_fees_annual">Copropriété (annuelle)</Label>
            <MoneyInput
              id="condo_fees_annual"
              name="condo_fees_annual"
              defaultValue={property?.condo_fees_annual ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="insurance_annual">Assurance (annuelle)</Label>
            <MoneyInput
              id="insurance_annual"
              name="insurance_annual"
              defaultValue={property?.insurance_annual ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="management_fees_annual">Frais de gestion (annuels)</Label>
            <MoneyInput
              id="management_fees_annual"
              name="management_fees_annual"
              defaultValue={property?.management_fees_annual ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="maintenance_annual">Entretien (annuel)</Label>
            <MoneyInput
              id="maintenance_annual"
              name="maintenance_annual"
              defaultValue={property?.maintenance_annual ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="other_charges_annual">Autres charges (annuelles)</Label>
            <MoneyInput
              id="other_charges_annual"
              name="other_charges_annual"
              defaultValue={property?.other_charges_annual ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
