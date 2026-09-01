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

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

// Le fichier ne transite jamais par une Server Action : Vercel plafonne le
// corps d'une Function à 4,5 Mo au niveau infrastructure (non configurable
// depuis le code), ce qui ferait planter l'import de tout PDF ou photo un
// peu lourd. Le navigateur envoie donc le fichier directement à Supabase
// Storage, et cette validation ne s'applique qu'au fichier avant l'envoi.
export const documentFileSchema = z
  .instanceof(File, { message: "Sélectionnez un fichier." })
  .refine((file) => file.size > 0, "Sélectionnez un fichier.")
  .refine((file) => file.size <= MAX_FILE_SIZE, "Le fichier ne doit pas dépasser 10 Mo.");

// Une fois le fichier déposé dans le bucket, la Server Action ne reçoit que
// ces métadonnées (texte, léger) pour enregistrer la ligne en base.
export const recordDocumentSchema = z.object({
  entity_type: z.enum(documentEntityTypes, { message: "Type d'entité invalide." }),
  entity_id: z.string().uuid("Entité invalide."),
  document_type: z.enum(documentTypes).default("autres"),
  file_name: z.string().trim().min(1, "Nom de fichier invalide.").max(255),
  storage_path: z.string().trim().min(1, "Chemin de stockage invalide."),
  size_bytes: z.number().int().positive().max(MAX_FILE_SIZE),
});
