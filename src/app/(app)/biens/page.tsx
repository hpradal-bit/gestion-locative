import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/components/shared/property-card";
import { Button } from "@/components/ui/button";
import { listProperties } from "@/features/properties/queries";

export default async function BiensPage() {
  const properties = await listProperties();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Mes biens"
        description="Gérez l'ensemble de votre patrimoine immobilier."
        action={
          <Button asChild>
            <Link href="/biens/nouveau">
              <Plus />
              Ajouter un bien
            </Link>
          </Button>
        }
      />
      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun bien pour l'instant"
          description="Ajoutez votre premier bien pour commencer à suivre son coût, sa location et sa rentabilité."
          action={
            <Button asChild>
              <Link href="/biens/nouveau">
                <Plus />
                Ajouter un bien
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
