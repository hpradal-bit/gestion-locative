import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function LocatairesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Locataires"
        description="Gérez vos locataires et leurs baux."
        action={<Button disabled>Ajouter un locataire</Button>}
      />
      <EmptyState
        icon={Users}
        title="Aucun locataire pour l'instant"
        description="La gestion des locataires et des baux sera développée à la Phase 4."
      />
    </div>
  );
}
