import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

export const expenseCategories = [
  "copropriete",
  "taxe_fonciere",
  "assurance",
  "travaux",
  "entretien",
  "reparation",
  "gestion",
  "banque",
  "energie",
  "autres",
] as const;

export const expenseSchema = z.object({
  property_id: z.string().uuid("Sélectionnez un bien."),
  category: z.enum(expenseCategories, { message: "Catégorie invalide." }),
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0."),
  expense_date: z.string().min(1, "La date est requise."),
  description: optionalText,
  supplier: optionalText,
  is_recurring: z.coerce.boolean().default(false),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export function parseExpenseFormData(formData: FormData) {
  return expenseSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    is_recurring: formData.get("is_recurring") === "on",
  });
}
