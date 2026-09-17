import type { Tables } from "@/lib/supabase/database.types";

export type CustomCharge = { label: string; amount: number };

/** Lit la colonne jsonb custom_charges d'un bien en liste typée, sans jamais planter sur une valeur inattendue. */
export function parseCustomCharges(
  value: Tables<"properties">["custom_charges"] | undefined
): CustomCharge[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "label" in item &&
      "amount" in item &&
      typeof item.label === "string" &&
      typeof item.amount === "number"
    ) {
      return [{ label: item.label, amount: item.amount }];
    }
    return [];
  });
}
