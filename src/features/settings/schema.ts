import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

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
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;

export function parseOwnerProfileFormData(formData: FormData) {
  return ownerProfileSchema.safeParse(Object.fromEntries(formData.entries()));
}
