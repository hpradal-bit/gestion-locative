import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LeaseForm } from "@/features/leases/lease-form";
import { createLease } from "@/features/leases/actions";
import { getTenant } from "@/features/tenants/queries";
import { listProperties } from "@/features/properties/queries";

export default async function NouveauBailPage({
  params,
}: PageProps<"/locataires/[id]/baux/nouveau">) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    notFound();
  }

  const properties = await listProperties();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`Créer un bail — ${tenant.first_name} ${tenant.last_name}`}
        description="Les échéances de loyer des 12 prochains mois seront générées automatiquement."
      />
      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun bien disponible"
          description="Ajoutez d'abord un bien pour pouvoir y associer ce locataire."
        />
      ) : (
        <LeaseForm tenantId={tenant.id} properties={properties} action={createLease.bind(null, tenant.id)} />
      )}
    </div>
  );
}
