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

export const leaseTypes = ["vide", "meuble", "mobilite", "commercial", "autre"] as const;

export const leaseSchema = z.object({
  property_id: z.string().uuid("Sélectionnez un bien."),
  tenant_id: z.string().uuid("Locataire invalide."),
  start_date: z.string().min(1, "La date de début est requise."),
  end_date: optionalDate,
  lease_type: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(leaseTypes, { message: "Type de bail invalide." }).optional()
  ),
  initial_rent: z.coerce.number().min(0.01, "Le loyer doit être supérieur à 0."),
  charges: money,
  security_deposit: money,
  irl_index: optionalText,
  next_revision_date: optionalDate,
});

export type LeaseInput = z.infer<typeof leaseSchema>;

export function parseLeaseFormData(formData: FormData) {
  return leaseSchema.safeParse(Object.fromEntries(formData.entries()));
}
