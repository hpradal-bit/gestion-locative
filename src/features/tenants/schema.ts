import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional()
);

export const tenantSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis."),
  last_name: z.string().trim().min(1, "Le nom est requis."),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Adresse email invalide.").optional()
  ),
  phone: optionalText,
  address: optionalText,
  birth_date: optionalDate,
});

export type TenantInput = z.infer<typeof tenantSchema>;

export function parseTenantFormData(formData: FormData) {
  return tenantSchema.safeParse(Object.fromEntries(formData.entries()));
}
