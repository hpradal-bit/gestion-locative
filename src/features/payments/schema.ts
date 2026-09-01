import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

export const paymentMethods = ["virement", "especes", "cheque", "prelevement", "autre"] as const;

export const paymentSchema = z.object({
  rent_schedule_id: z.string().uuid("Échéance invalide."),
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0."),
  paid_at: z.string().min(1, "La date de paiement est requise."),
  payment_method: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(paymentMethods, { message: "Moyen de paiement invalide." }).optional()
  ),
  comment: optionalText,
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export function parsePaymentFormData(formData: FormData) {
  return paymentSchema.safeParse(Object.fromEntries(formData.entries()));
}

export const updatePaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0."),
  paid_at: z.string().min(1, "La date de paiement est requise."),
  payment_method: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(paymentMethods, { message: "Moyen de paiement invalide." }).optional()
  ),
  comment: optionalText,
});

export function parseUpdatePaymentFormData(formData: FormData) {
  return updatePaymentSchema.safeParse(Object.fromEntries(formData.entries()));
}
