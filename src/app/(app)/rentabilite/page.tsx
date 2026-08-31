import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function RentabilitePage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Rentabilité"
        description="Analyse financière de chaque investissement."
      />
      <EmptyState
        icon={TrendingUp}
        title="Aucune analyse pour l'instant"
        description="Les calculs de rentabilité brute, nette, nette après financement et de cash-flow seront développés à la Phase 10, une fois qu'un bien existera."
      />
    </div>
  );
}
