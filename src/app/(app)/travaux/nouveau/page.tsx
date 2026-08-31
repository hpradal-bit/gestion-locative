import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { WorkForm } from "@/features/works/work-form";
import { createWork } from "@/features/works/actions";
import { listProperties } from "@/features/properties/queries";

export const metadata: Metadata = { title: "Ajouter un chantier" };

export default async function NouveauChantierPage() {
  const properties = await listProperties();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Ajouter un chantier" />
      <WorkForm properties={properties} action={createWork} submitLabel="Créer le chantier" />
    </div>
  );
}
