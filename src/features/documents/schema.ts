import { z } from "zod";

export const documentEntityTypes = [
  "property",
  "tenant",
  "lease",
  "expense",
  "work",
  "loan",
  "rent_schedule",
] as const;

export const documentTypes = [
  "facture",
  "quittance",
  "bail",
  "devis",
  "assurance",
  "taxe_fonciere",
  "autres",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

export const uploadDocumentSchema = z.object({
  entity_type: z.enum(documentEntityTypes, { message: "Type d'entité invalide." }),
  entity_id: z.string().uuid("Entité invalide."),
  document_type: z.enum(documentTypes).default("autres"),
  file: z
    .instanceof(File, { message: "Sélectionnez un fichier." })
    .refine((file) => file.size > 0, "Sélectionnez un fichier.")
    .refine((file) => file.size <= MAX_FILE_SIZE, "Le fichier ne doit pas dépasser 10 Mo."),
});

export function parseUploadDocumentFormData(formData: FormData) {
  return uploadDocumentSchema.safeParse({
    entity_type: formData.get("entity_type"),
    entity_id: formData.get("entity_id"),
    document_type: formData.get("document_type") || "autres",
    file: formData.get("file"),
  });
}
