"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/features/activity/log";
import { taxRegimes } from "@/lib/finance";

const regimeSchema = z.enum(taxRegimes);

export type SetPropertyTaxRegimeResult = { error: string | null };

/**
 * Choisit le régime fiscal d'un bien depuis la page Impôts, sans passer par
 * le formulaire complet du bien — sélection en un clic après comparaison
 * des simulations.
 */
export async function setPropertyTaxRegime(
  propertyId: string,
  regime: string
): Promise<SetPropertyTaxRegimeResult> {
  const parsed = regimeSchema.safeParse(regime);
  if (!parsed.success) {
    return { error: "Régime fiscal invalide." };
  }

  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .update({ tax_regime: parsed.data })
    .eq("id", propertyId)
    .select("name")
    .single();

  if (error || !property) {
    return { error: "Impossible d'enregistrer le régime fiscal. Réessayez." };
  }

  await logActivity({
    action: "property_updated",
    entityLabel: `${property.name} — régime fiscal choisi`,
  });

  revalidatePath("/impots");
  revalidatePath(`/biens/${propertyId}`);
  return { error: null };
}
