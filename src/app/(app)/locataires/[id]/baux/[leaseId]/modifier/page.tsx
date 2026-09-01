import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { LeaseForm } from "@/features/leases/lease-form";
import { updateLease } from "@/features/leases/actions";
import { getLease } from "@/features/leases/queries";
import { getTenant } from "@/features/tenants/queries";
import { listProperties } from "@/features/properties/queries";

export default async function ModifierBailPage({
  params,
}: PageProps<"/locataires/[id]/baux/[leaseId]/modifier">) {
  const { id, leaseId } = await params;
  const [tenant, lease, properties] = await Promise.all([
    getTenant(id),
    getLease(leaseId),
    listProperties(),
  ]);

  if (!tenant || !lease || lease.tenant_id !== tenant.id) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`Modifier le bail — ${tenant.first_name} ${tenant.last_name}`}
        description="Les échéances de loyer déjà générées ne sont pas recalculées automatiquement."
      />
      <LeaseForm
        tenantId={tenant.id}
        properties={properties}
        lease={lease}
        action={updateLease.bind(null, lease.id, tenant.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
