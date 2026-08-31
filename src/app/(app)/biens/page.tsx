import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function BiensPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Mes biens"
        description="Gérez l'ensemble de votre patrimoine immobilier."
        action={<Button disabled>Ajouter un bien</Button>}
      />
      <EmptyState
        icon={Building2}
        title="Aucun bien pour l'instant"
        description="La création et la gestion des biens sera développée à la Phase 3 (fiche complète, acquisition, financement, location, charges)."
      />
    </div>
  );
}
