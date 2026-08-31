import { FolderOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function DocumentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Quittances, factures, contrats et autres documents."
      />
      <EmptyState
        icon={FolderOpen}
        title="Aucun document pour l'instant"
        description="La bibliothèque documentaire (stockage, classement, recherche) sera développée à la Phase 13."
      />
    </div>
  );
}
