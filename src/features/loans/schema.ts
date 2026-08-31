import { z } from "zod";

const money = z.coerce.number().min(0, "Le montant doit être positif ou nul").default(0);

export const loanSchema = z.object({
  property_id: z.string().uuid("Sélectionnez un bien."),
  initial_amount: z.coerce.number().min(0.01, "Le montant emprunté doit être supérieur à 0."),
  down_payment: money,
  annual_interest_rate: z.coerce.number().min(0, "Le taux doit être positif ou nul."),
  duration_months: z.coerce.number().int().min(1, "La durée doit être d'au moins 1 mois."),
  monthly_insurance: money,
  start_date: z.string().min(1, "La date de début est requise."),
});

export type LoanInput = z.infer<typeof loanSchema>;

export function parseLoanFormData(formData: FormData) {
  return loanSchema.safeParse(Object.fromEntries(formData.entries()));
}
