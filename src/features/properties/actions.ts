"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/features/activity/log";
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
    .insert({
      ...parsed.data,
      current_value_updated_at:
        parsed.data.current_value !== undefined ? new Date().toISOString().slice(0, 10) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({ action: "property_created", entityLabel: parsed.data.name });

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

  // La date de dernière valorisation ne doit bouger que si la valorisation
  // elle-même change — pas à chaque modification du bien.
  const { data: existing } = await supabase
    .from("properties")
    .select("current_value")
    .eq("id", propertyId)
    .maybeSingle();

  const valuationChanged = (existing?.current_value ?? null) !== (parsed.data.current_value ?? null);

  const { error } = await supabase
    .from("properties")
    .update({
      ...parsed.data,
      ...(valuationChanged
        ? {
            current_value_updated_at:
              parsed.data.current_value !== undefined
                ? new Date().toISOString().slice(0, 10)
                : null,
          }
        : {}),
    })
    .eq("id", propertyId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({ action: "property_updated", entityLabel: parsed.data.name });

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
