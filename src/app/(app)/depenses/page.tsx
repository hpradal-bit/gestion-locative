import { Receipt } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function DepensesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dépenses"
        description="Charges, travaux et autres dépenses par bien."
        action={<Button disabled>Ajouter une dépense</Button>}
      />
      <EmptyState
        icon={Receipt}
        title="Aucune dépense pour l'instant"
        description="Le suivi des dépenses par catégorie sera développé à la Phase 7."
      />
    </div>
  );
}
