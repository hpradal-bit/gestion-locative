import { Calculator } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function SimulateurPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Simulateur"
        description="Simulez un nouveau projet immobilier et comparez des scénarios."
        action={<Button disabled>Nouvelle simulation</Button>}
      />
      <EmptyState
        icon={Calculator}
        title="Aucune simulation pour l'instant"
        description="Le simulateur d'investissement, le score du projet et la comparaison de scénarios seront développés à la Phase 11."
      />
    </div>
  );
}
