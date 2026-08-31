import { Hammer } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function TravauxPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Travaux"
        description="Devis, chantiers, factures et suivi."
        action={<Button disabled>Ajouter un chantier</Button>}
      />
      <EmptyState
        icon={Hammer}
        title="Aucun chantier pour l'instant"
        description="Le suivi des travaux (devis, statuts, factures) sera développé à la Phase 8 et alimentera automatiquement les dépenses."
      />
    </div>
  );
}
