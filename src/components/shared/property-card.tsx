import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateGrossYield, calculateTotalProjectCost } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";
import { PROPERTY_TYPE_LABELS } from "@/features/properties/constants";
import type { propertyTypes } from "@/features/properties/schema";

export function PropertyCard({ property }: { property: Tables<"properties"> }) {
  const grossYield = calculateGrossYield({
    annualRent: property.monthly_rent * 12,
    totalProjectCost: calculateTotalProjectCost({
      purchasePrice: property.purchase_price ?? 0,
      notaryFees: property.notary_fees,
      agencyFees: property.agency_fees,
      worksBudget: property.works_budget,
      furnitureBudget: property.furniture_budget,
      otherFees: property.other_acquisition_fees,
    }),
  });

  const typeLabel = property.property_type
    ? PROPERTY_TYPE_LABELS[property.property_type as (typeof propertyTypes)[number]]
    : null;

  return (
    <Link href={`/biens/${property.id}`}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold leading-tight">{property.name}</p>
              {(property.city || property.address) && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {[property.address, property.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
          {typeLabel && <Badge variant="secondary">{typeLabel}</Badge>}
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Loyer mensuel</p>
            <p className="font-medium">{formatCurrency(property.monthly_rent)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Rentabilité brute</p>
            <p className="font-medium">{formatPercent(grossYield)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
