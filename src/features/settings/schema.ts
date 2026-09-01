import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

// Tranches du barème IR 2026 (voir lib/finance/tax.ts) — une seule valeur
// choisie par l'utilisateur, pas un calcul du barème complet.
export const tmiRates = [0, 0.11, 0.3, 0.41, 0.45] as const;

export const ownerProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom est requis."),
  address: optionalText,
  city: optionalText,
  postal_code: optionalText,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Adresse email invalide.").optional()
  ),
  phone: optionalText,
  tmi_rate: z.coerce
    .number()
    .refine((v): v is (typeof tmiRates)[number] => (tmiRates as readonly number[]).includes(v), {
      message: "Tranche d'imposition invalide.",
    }),
  social_charges_applicable: z.coerce.boolean().default(true),
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;

export function parseOwnerProfileFormData(formData: FormData) {
  return ownerProfileSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    social_charges_applicable: formData.get("social_charges_applicable") === "on",
  });
}
