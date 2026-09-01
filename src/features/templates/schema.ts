import { z } from "zod";

import { templateCategories } from "./constants";

export const templateSchema = z.object({
  category: z.enum(templateCategories, { message: "Catégorie invalide." }),
  name: z.string().trim().min(1, "Le nom du modèle est requis.").max(120),
  content: z.string().trim().min(1, "Le contenu du modèle est requis."),
});

export type TemplateInput = z.infer<typeof templateSchema>;

export function parseTemplateFormData(formData: FormData) {
  return templateSchema.safeParse(Object.fromEntries(formData.entries()));
}
