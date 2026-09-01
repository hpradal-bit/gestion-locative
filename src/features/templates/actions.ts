"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseTemplateFormData } from "./schema";

export type TemplateActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR = "Impossible d'enregistrer le modèle. Vérifiez les informations puis réessayez.";

export async function createTemplate(
  _prevState: TemplateActionState,
  formData: FormData
): Promise<TemplateActionState> {
  const parsed = parseTemplateFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("document_templates").insert(parsed.data);
  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/modeles");
  return { error: null, success: true };
}

export async function updateTemplate(
  templateId: string,
  _prevState: TemplateActionState,
  formData: FormData
): Promise<TemplateActionState> {
  const parsed = parseTemplateFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("document_templates")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", templateId);
  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/modeles");
  return { error: null, success: true };
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("document_templates").delete().eq("id", templateId);
  if (error) {
    throw new Error("Impossible de supprimer ce modèle. Réessayez.");
  }
  revalidatePath("/modeles");
}
