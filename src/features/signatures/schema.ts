import { z } from "zod";

export const signerNameSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis."),
  last_name: z.string().trim().min(1, "Le nom est requis."),
});

export type SignerNameInput = z.infer<typeof signerNameSchema>;
