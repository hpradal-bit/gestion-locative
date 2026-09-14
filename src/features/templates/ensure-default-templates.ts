import { createClient } from "@/lib/supabase/server";
import { BOX_GARAGE_TEMPLATE_NAME, BOX_GARAGE_TEMPLATE_CONTENT } from "./box-garage-template";

/**
 * Modèles fournis par défaut avec l'application. Comme pour les échéances
 * de loyer, il n'y a pas de tâche planifiée : on s'assure qu'ils existent
 * pour l'utilisateur courant à chaque chargement de l'espace applicatif.
 * Idempotent : ne recrée rien si le modèle existe déjà (par nom + catégorie).
 */
export async function ensureDefaultTemplates(): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("document_templates")
    .select("id")
    .eq("category", "bail")
    .eq("name", BOX_GARAGE_TEMPLATE_NAME)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from("document_templates").insert({
    category: "bail",
    name: BOX_GARAGE_TEMPLATE_NAME,
    content: BOX_GARAGE_TEMPLATE_CONTENT,
  });
}
