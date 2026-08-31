import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProperty } from "@/features/properties/queries";
import { deleteProperty } from "@/features/properties/actions";
import { PROPERTY_TYPE_LABELS } from "@/features/properties/constants";
import type { propertyTypes } from "@/features/properties/schema";
import {
  calculateGrossYield,
  calculateNetYield,
  calculateTotalProjectCost,
} from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function BienDetailPage({
  params,
}: PageProps<"/biens/[id]">) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const totalProjectCost = calculateTotalProjectCost({
    purchasePrice: property.purchase_price ?? 0,
    notaryFees: property.notary_fees,
    agencyFees: property.agency_fees,
    worksBudget: property.works_budget,
    furnitureBudget: property.furniture_budget,
    otherFees: property.other_acquisition_fees,
  });

  const annualRecurringExpenses =
    property.property_tax_annual +
    property.condo_fees_annual +
    property.insurance_annual +
    property.management_fees_annual +
    property.maintenance_annual +
    property.other_charges_annual;

  const grossYield = calculateGrossYield({
    annualRent: property.monthly_rent * 12,
    totalProjectCost,
  });
  const netYield = calculateNetYield({
    annualRent: property.monthly_rent * 12,
    annualRecurringExpenses,
    totalProjectCost,
  });

  const typeLabel = property.property_type
    ? PROPERTY_TYPE_LABELS[property.property_type as (typeof propertyTypes)[number]]
    : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={property.name}
        description={[property.address, property.city].filter(Boolean).join(", ") || undefined}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/biens/${property.id}/modifier`}>
                <Pencil />
                Modifier
              </Link>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 />
                  Supprimer
                </Button>
              }
              title="Supprimer ce bien ?"
              description="Cette action est irréversible. Le bien et toutes ses données associées seront supprimés."
              confirmLabel="Supprimer"
              action={deleteProperty.bind(null, property.id)}
            />
          </div>
        }
      />

      {typeLabel && <Badge variant="secondary" className="w-fit">{typeLabel}</Badge>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Prix d'achat" value={formatCurrency(property.purchase_price ?? 0)} />
            <InfoRow label="Frais de notaire" value={formatCurrency(property.notary_fees)} />
            <InfoRow label="Frais d'agence" value={formatCurrency(property.agency_fees)} />
            <InfoRow label="Travaux" value={formatCurrency(property.works_budget)} />
            <InfoRow label="Mobilier" value={formatCurrency(property.furniture_budget)} />
            <InfoRow label="Autres frais" value={formatCurrency(property.other_acquisition_fees)} />
            <InfoRow
              label="Coût total du projet"
              value={<span className="text-base">{formatCurrency(totalProjectCost)}</span>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & rentabilité</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Loyer mensuel" value={formatCurrency(property.monthly_rent)} />
            <InfoRow label="Charges mensuelles" value={formatCurrency(property.monthly_charges)} />
            <InfoRow label="Loyer annuel" value={formatCurrency(property.monthly_rent * 12)} />
            <InfoRow label="Rentabilité brute" value={formatPercent(grossYield)} />
            <InfoRow label="Rentabilité nette" value={formatPercent(netYield)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Surface" value={property.surface_m2 ? `${property.surface_m2} m²` : "—"} />
            <InfoRow label="Pièces" value={property.rooms ?? "—"} />
            <InfoRow label="Étage" value={property.floor ?? "—"} />
            <InfoRow label="Ascenseur" value={property.has_elevator ? "Oui" : "Non"} />
            <InfoRow label="Parking" value={property.has_parking ? "Oui" : "Non"} />
            <InfoRow label="Cave" value={property.has_cellar ? "Oui" : "Non"} />
            <InfoRow label="Balcon" value={property.has_balcony ? "Oui" : "Non"} />
            <InfoRow label="Meublé" value={property.is_furnished ? "Oui" : "Non"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charges annuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Taxe foncière" value={formatCurrency(property.property_tax_annual)} />
            <InfoRow label="Copropriété" value={formatCurrency(property.condo_fees_annual)} />
            <InfoRow label="Assurance" value={formatCurrency(property.insurance_annual)} />
            <InfoRow label="Gestion" value={formatCurrency(property.management_fees_annual)} />
            <InfoRow label="Entretien" value={formatCurrency(property.maintenance_annual)} />
            <InfoRow label="Autres" value={formatCurrency(property.other_charges_annual)} />
            <InfoRow
              label="Total charges annuelles"
              value={<span className="text-base">{formatCurrency(annualRecurringExpenses)}</span>}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
