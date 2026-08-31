import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { PropertyForm } from "@/features/properties/property-form";
import { updateProperty } from "@/features/properties/actions";
import { getProperty } from "@/features/properties/queries";

export default async function ModifierBienPage({
  params,
}: PageProps<"/biens/[id]/modifier">) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`Modifier ${property.name}`}
        description="Les calculs (coût total, rentabilité) se mettent à jour automatiquement."
      />
      <PropertyForm
        property={property}
        action={updateProperty.bind(null, property.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
