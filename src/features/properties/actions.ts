"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parsePropertyFormData } from "./schema";

export type PropertyActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer le bien. Vérifiez les informations puis réessayez.";

export async function createProperty(
  _prevState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const parsed = parsePropertyFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/biens");
  redirect(`/biens/${data.id}`);
}

export async function updateProperty(
  propertyId: string,
  _prevState: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const parsed = parsePropertyFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update(parsed.data)
    .eq("id", propertyId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/biens");
  revalidatePath(`/biens/${propertyId}`);
  redirect(`/biens/${propertyId}`);
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", propertyId);

  if (error) {
    throw new Error(
      "Impossible de supprimer ce bien. Vérifiez qu'aucun locataire, dépense ou crédit n'y est encore rattaché."
    );
  }

  revalidatePath("/biens");
  redirect("/biens");
}
