import { createClient } from "@/lib/supabase/server";
import { BOX_GARAGE_TEMPLATE_NAME, BOX_GARAGE_TEMPLATE_CONTENT } from "./box-garage-template";

/**
 * Modèles fournis par défaut avec l'application. Comme pour les échéances
 * de loyer, il n'y a pas de tâche planifiée : on s'assure qu'ils existent
 * pour l'utilisateur courant à chaque chargement de l'espace applicatif,
 * et on tient leur contenu synchronisé avec le code — ce modèle est
 * maintenu depuis l'application, pas depuis l'éditeur de modèles, pour que
 * les améliorations profitent automatiquement à tout le monde sans
 * dépendre d'une insertion figée au premier chargement. On le retrouve via
 * is_default plutôt que par son nom, que l'utilisateur reste libre de
 * changer sans qu'un doublon soit réinséré au chargement suivant.
 */
export async function ensureDefaultTemplates(): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("document_templates")
    .select("id, content")
    .eq("category", "bail")
    .eq("is_default", true)
    .maybeSingle();

  if (!existing) {
    await supabase.from("document_templates").insert({
      category: "bail",
      name: BOX_GARAGE_TEMPLATE_NAME,
      content: BOX_GARAGE_TEMPLATE_CONTENT,
      is_default: true,
    });
    return;
  }

  if (existing.content !== BOX_GARAGE_TEMPLATE_CONTENT) {
    await supabase
      .from("document_templates")
      .update({ content: BOX_GARAGE_TEMPLATE_CONTENT, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  }
}
