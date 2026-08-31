import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TenantCard } from "@/components/shared/tenant-card";
import { Button } from "@/components/ui/button";
import { listTenants } from "@/features/tenants/queries";

export default async function LocatairesPage() {
  const tenants = await listTenants();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Locataires"
        description="Gérez vos locataires et leurs baux."
        action={
          <Button asChild>
            <Link href="/locataires/nouveau">
              <Plus />
              Ajouter un locataire
            </Link>
          </Button>
        }
      />
      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun locataire pour l'instant"
          description="Ajoutez un locataire puis créez son bail pour générer automatiquement ses échéances de loyer."
          action={
            <Button asChild>
              <Link href="/locataires/nouveau">
                <Plus />
                Ajouter un locataire
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
