import { Landmark } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function FinancementsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Financements"
        description="Crédits immobiliers et tableaux d'amortissement."
        action={<Button disabled>Ajouter un crédit</Button>}
      />
      <EmptyState
        icon={Landmark}
        title="Aucun crédit pour l'instant"
        description="La gestion des financements et le tableau d'amortissement seront développés à la Phase 9."
      />
    </div>
  );
}
