import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export const activityActions = [
  "reminder_sent",
  "receipt_generated",
  "payment_recorded",
  "lease_created",
  "lease_updated",
  "lease_ended",
  "document_added",
  "document_deleted",
  "property_created",
  "property_updated",
  "simulation_created",
  "simulation_updated",
] as const;

export type ActivityAction = (typeof activityActions)[number];

/**
 * Journalise un événement important. Ne doit jamais bloquer l'action
 * métier appelante : une erreur d'écriture dans le journal est avalée
 * plutôt que de faire échouer, par exemple, l'enregistrement d'un
 * paiement pour une simple panne du journal.
 */
export async function logActivity(input: {
  action: ActivityAction;
  entityLabel: string;
  metadata?: Record<string, Json>;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("activity_events").insert({
      action: input.action,
      entity_label: input.entityLabel,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Le journal d'activité est un confort, pas une garantie transactionnelle.
  }
}
