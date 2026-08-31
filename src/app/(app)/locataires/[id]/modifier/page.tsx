import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { TenantForm } from "@/features/tenants/tenant-form";
import { updateTenant } from "@/features/tenants/actions";
import { getTenant } from "@/features/tenants/queries";

export default async function ModifierLocatairePage({
  params,
}: PageProps<"/locataires/[id]/modifier">) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title={`Modifier ${tenant.first_name} ${tenant.last_name}`} />
      <TenantForm
        tenant={tenant}
        action={updateTenant.bind(null, tenant.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
