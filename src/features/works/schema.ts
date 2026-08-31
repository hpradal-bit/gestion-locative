import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional()
);

const money = z.coerce.number().min(0, "Le montant doit être positif ou nul").default(0);

export const workStatuses = ["a_prevoir", "prevu", "en_cours", "termine", "paye"] as const;

export const workSchema = z.object({
  property_id: z.string().uuid("Sélectionnez un bien."),
  description: z.string().trim().min(1, "La description est requise."),
  company: optionalText,
  quote_amount: money,
  estimated_amount: money,
  actual_amount: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().min(0).optional()
  ),
  start_date: optionalDate,
  end_date: optionalDate,
  status: z.enum(workStatuses, { message: "Statut invalide." }),
});

export type WorkInput = z.infer<typeof workSchema>;

export function parseWorkFormData(formData: FormData) {
  return workSchema.safeParse(Object.fromEntries(formData.entries()));
}
