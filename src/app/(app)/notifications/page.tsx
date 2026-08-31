import { Bell } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Relances et alertes."
      />
      <EmptyState
        icon={Bell}
        title="Aucune notification pour l'instant"
        description="Les alertes automatiques (impayés, révisions de loyer, assurances, crédits) seront développées à la Phase 12."
      />
    </div>
  );
}
