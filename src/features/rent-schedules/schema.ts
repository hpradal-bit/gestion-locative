import { z } from "zod";

export const updateRentScheduleSchema = z.object({
  due_date: z.string().min(1, "La date d'échéance est requise."),
  rent_amount: z.coerce.number().min(0, "Le loyer doit être positif ou nul."),
  charges_amount: z.coerce.number().min(0, "Les charges doivent être positives ou nulles."),
});

export function parseUpdateRentScheduleFormData(formData: FormData) {
  return updateRentScheduleSchema.safeParse(Object.fromEntries(formData.entries()));
}
