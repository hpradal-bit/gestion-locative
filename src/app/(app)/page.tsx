import { LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Vue globale de votre patrimoine locatif."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Les KPIs et graphiques arrivent à la Phase 2"
        description="Cette page affichera la valeur du patrimoine, les loyers, le cash-flow et les alertes dès que la Phase 2 (Dashboard) sera développée."
      />
    </div>
  );
}
