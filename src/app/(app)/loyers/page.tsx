import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function LoyersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Loyers"
        description="Échéances, paiements, statuts et historique."
      />
      <EmptyState
        icon={Wallet}
        title="Aucune échéance pour l'instant"
        description="Les échéances de loyer, les paiements et les statuts (payé, en attente, en retard, partiel) seront développés à la Phase 5, puis les quittances à la Phase 6."
      />
    </div>
  );
}
