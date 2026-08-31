import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { PropertyForm } from "@/features/properties/property-form";
import { createProperty } from "@/features/properties/actions";

export const metadata: Metadata = { title: "Ajouter un bien" };

export default function NouveauBienPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Ajouter un bien"
        description="Renseignez les informations du bien — le coût total et la rentabilité se calculent automatiquement."
      />
      <PropertyForm action={createProperty} submitLabel="Créer le bien" />
    </div>
  );
}
