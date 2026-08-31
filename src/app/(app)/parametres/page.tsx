import { Settings } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function ParametresPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Paramètres"
        description="Profil, propriétaire, préférences et configuration."
      />
      <EmptyState
        icon={Settings}
        title="Réglages à venir"
        description="Le profil, les informations du propriétaire et les préférences (devise, format de date, notifications) seront développés au fil des phases suivantes."
      />
    </div>
  );
}
