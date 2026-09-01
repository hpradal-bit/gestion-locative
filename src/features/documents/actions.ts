"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { recordDocumentSchema } from "./schema";

export type DocumentActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR = "Impossible d'importer le document. Vérifiez le fichier puis réessayez.";

/**
 * Enregistre les métadonnées d'un document déjà déposé côté client dans
 * Supabase Storage (voir upload-dialog.tsx). Le fichier lui-même ne passe
 * jamais par cette Server Action — uniquement du texte — pour ne pas se
 * heurter à la limite de 4,5 Mo imposée par Vercel sur le corps des
 * Functions.
 */
export async function recordDocument(input: {
  entity_type: string;
  entity_id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  size_bytes: number;
}): Promise<DocumentActionState> {
  const parsed = recordDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const { storage_path, ...rest } = parsed.data;
  if (!storage_path.startsWith(`${user.id}/`)) {
    return { error: GENERIC_ERROR };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    ...rest,
    storage_path,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([storage_path]);
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/documents");
  return { error: null, success: true };
}

export async function deleteDocument(documentId: string, storagePath: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) {
    throw new Error("Impossible de supprimer ce document. Réessayez.");
  }

  await supabase.storage.from("documents").remove([storagePath]);
  revalidatePath("/documents");
}

export async function getDocumentDownloadUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60 * 5);
  return data?.signedUrl ?? null;
}
