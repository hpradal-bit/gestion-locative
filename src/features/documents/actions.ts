"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseUploadDocumentFormData } from "./schema";

export type DocumentActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR = "Impossible d'importer le document. Vérifiez le fichier puis réessayez.";

export async function uploadDocument(
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const parsed = parseUploadDocumentFormData(formData);
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

  const { entity_type, entity_id, document_type, file } = parsed.data;
  const storagePath = `${user.id}/${entity_type}/${entity_id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type || undefined });

  if (uploadError) {
    return { error: GENERIC_ERROR };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    entity_type,
    entity_id,
    document_type,
    file_name: file.name,
    storage_path: storagePath,
    size_bytes: file.size,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([storagePath]);
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
