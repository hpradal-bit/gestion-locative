"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/features/activity/log";
import { parseUpdateRentScheduleFormData } from "./schema";

export type RentScheduleActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR = "Impossible d'enregistrer l'échéance. Vérifiez les informations puis réessayez.";

/**
 * Correction manuelle d'une échéance déjà générée (montant erroné, date
 * décalée...). Volontairement indépendante du bail : une échéance,
 * une fois émise, peut diverger du bail sans que celui-ci soit modifié —
 * cohérent avec la règle appliquée à l'édition de bail (les échéances
 * déjà générées ne sont jamais réécrites automatiquement).
 */
export async function updateRentSchedule(
  scheduleId: string,
  _prevState: RentScheduleActionState,
  formData: FormData
): Promise<RentScheduleActionState> {
  const parsed = parseUpdateRentScheduleFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("rent_schedules")
    .update(parsed.data)
    .eq("id", scheduleId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({ action: "lease_updated", entityLabel: "Échéance de loyer modifiée" });

  revalidatePath("/loyers");
  revalidatePath("/");
  return { error: null, success: true };
}

/** Supprime une échéance mal renseignée. Les paiements associés sont supprimés en cascade. */
export async function deleteRentSchedule(scheduleId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("rent_schedules").delete().eq("id", scheduleId);

  if (error) {
    throw new Error("Impossible de supprimer cette échéance. Réessayez.");
  }

  await logActivity({ action: "lease_updated", entityLabel: "Échéance de loyer supprimée" });

  revalidatePath("/loyers");
  revalidatePath("/");
}
