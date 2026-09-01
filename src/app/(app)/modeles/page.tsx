import { FileStack, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TemplateDialog } from "@/features/templates/template-dialog";
import { createTemplate, updateTemplate, deleteTemplate } from "@/features/templates/actions";
import { listTemplates } from "@/features/templates/queries";
import { TEMPLATE_CATEGORY_LABELS } from "@/features/templates/constants";
import type { TemplateCategory } from "@/features/templates/constants";

export default async function ModelesPage() {
  const templates = await listTemplates();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Mes modèles"
        description="Modèles de documents réutilisables avec variables dynamiques."
        action={
          <TemplateDialog
            action={createTemplate}
            trigger={
              <Button>
                <Plus />
                Nouveau modèle
              </Button>
            }
          />
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="Aucun modèle pour l'instant"
          description="Créez un modèle de bail, d'état des lieux ou de relance avec des variables comme {{nom_locataire}} — elles seront remplacées automatiquement à la génération."
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col divide-y p-0">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{template.name}</p>
                    <Badge variant="secondary">
                      {TEMPLATE_CATEGORY_LABELS[template.category as TemplateCategory] ??
                        template.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <TemplateDialog
                    template={template}
                    action={updateTemplate.bind(null, template.id)}
                    trigger={
                      <Button size="sm" variant="ghost">
                        <Pencil />
                        Modifier
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        <Trash2 />
                      </Button>
                    }
                    title="Supprimer ce modèle ?"
                    description="Cette action est irréversible."
                    confirmLabel="Supprimer"
                    action={deleteTemplate.bind(null, template.id)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
