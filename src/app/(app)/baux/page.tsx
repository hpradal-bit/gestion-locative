import { FileSignature } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { listTemplates } from "@/features/templates/queries";
import { getActiveLeasesForDocuments } from "@/features/leases/queries";
import { LeaseDocumentGenerator } from "@/features/templates/lease-document-generator";

export default async function BauxPage({ searchParams }: PageProps<"/baux">) {
  const params = await searchParams;
  const defaultTemplateId = typeof params.templateId === "string" ? params.templateId : undefined;

  const [templates, activeLeases] = await Promise.all([
    listTemplates(),
    getActiveLeasesForDocuments(),
  ]);

  const bailTemplates = templates.filter((template) => template.category === "bail");
  const leases = activeLeases
    .filter((lease) => lease.tenants && lease.properties)
    .map((lease) => ({
      id: lease.id,
      label: `${lease.tenants!.first_name} ${lease.tenants!.last_name} — ${lease.properties!.name}`,
    }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Bails"
        description="Générez un bail depuis un modèle, prérempli avec les informations du locataire choisi, puis envoyez-le par email."
      />

      {bailTemplates.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="Aucun modèle de bail pour l'instant"
          description="Créez un modèle de catégorie « Bail de location » depuis Mes modèles pour pouvoir générer un bail ici."
        />
      ) : leases.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="Aucun bail actif"
          description="Créez un bail depuis la fiche d'un locataire pour pouvoir générer un document ici."
        />
      ) : (
        <LeaseDocumentGenerator
          templates={bailTemplates}
          leases={leases}
          defaultTemplateId={defaultTemplateId}
        />
      )}
    </div>
  );
}
