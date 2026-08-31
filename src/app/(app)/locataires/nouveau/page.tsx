import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { TenantForm } from "@/features/tenants/tenant-form";
import { createTenant } from "@/features/tenants/actions";

export const metadata: Metadata = { title: "Ajouter un locataire" };

export default function NouveauLocatairePage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Ajouter un locataire" />
      <TenantForm action={createTenant} submitLabel="Créer le locataire" />
    </div>
  );
}
