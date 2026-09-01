"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { extractFieldsFromDocument, type ExtractedField } from "@/lib/ai/gemini";
import { logActivity } from "@/features/activity/log";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { LEASE_EXTRACTION_FIELDS, APPLICABLE_LEASE_FIELDS } from "./lease-extraction";

export type AnalyzeDocumentResult =
  | { success: true; fields: ExtractedField[] }
  | { success: false; error: string };

const GENERIC_ERROR = "Impossible d'analyser ce document. Réessayez.";

function guessMimeType(fileName: string): string | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return null;
  }
}

/**
 * Analyse un bail déjà importé avec l'IA. Ne modifie jamais la base de
 * données : renvoie uniquement les champs détectés, à valider par
 * l'utilisateur (voir applyExtractedLeaseData).
 */
export async function analyzeLeaseDocument(documentId: string): Promise<AnalyzeDocumentResult> {
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("file_name, storage_path, entity_type")
    .eq("id", documentId)
    .maybeSingle();

  if (!document || document.entity_type !== "lease") {
    return { success: false, error: GENERIC_ERROR };
  }

  const mimeType = guessMimeType(document.file_name);
  if (!mimeType) {
    return {
      success: false,
      error: "Type de fichier non pris en charge pour l'analyse IA (PDF, JPG ou PNG uniquement).",
    };
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("documents")
    .download(document.storage_path);

  if (downloadError || !fileBlob) {
    return { success: false, error: GENERIC_ERROR };
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const fileBase64 = Buffer.from(arrayBuffer).toString("base64");

  return extractFieldsFromDocument({
    fileBase64,
    mimeType,
    fields: LEASE_EXTRACTION_FIELDS,
    documentDescription: "un bail de location résidentiel français",
  });
}

export type ApplyExtractedLeaseDataState = { error: string | null; success?: boolean };

/**
 * Écrit dans le bail les champs extraits, seulement après validation
 * explicite de l'utilisateur (potentiellement corrigés à la main) — jamais
 * automatiquement à partir du résultat brut de l'IA.
 */
export async function applyExtractedLeaseData(
  leaseId: string,
  fields: Partial<Record<(typeof APPLICABLE_LEASE_FIELDS)[number], string>>
): Promise<ApplyExtractedLeaseDataState> {
  const supabase = await createClient();

  const update: TablesUpdate<"leases"> = {};
  if (fields.loyer) {
    const rent = Number(fields.loyer.replace(",", "."));
    if (!Number.isFinite(rent) || rent <= 0) {
      return { error: "Loyer invalide." };
    }
    update.initial_rent = rent;
  }
  if (fields.charges) {
    const charges = Number(fields.charges.replace(",", "."));
    if (!Number.isFinite(charges) || charges < 0) {
      return { error: "Charges invalides." };
    }
    update.charges = charges;
  }
  if (fields.depot_garantie) {
    const deposit = Number(fields.depot_garantie.replace(",", "."));
    if (!Number.isFinite(deposit) || deposit < 0) {
      return { error: "Dépôt de garantie invalide." };
    }
    update.security_deposit = deposit;
  }
  if (fields.date_debut) {
    const parsed = parseFrenchDate(fields.date_debut);
    if (!parsed) return { error: "Date de début invalide (format attendu JJ/MM/AAAA)." };
    update.start_date = parsed;
  }
  if (fields.date_fin) {
    const parsed = parseFrenchDate(fields.date_fin);
    if (!parsed) return { error: "Date de fin invalide (format attendu JJ/MM/AAAA)." };
    update.end_date = parsed;
  }

  if (Object.keys(update).length === 0) {
    return { error: "Aucune information à appliquer." };
  }

  const { error } = await supabase.from("leases").update(update).eq("id", leaseId);
  if (error) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({
    action: "lease_updated",
    entityLabel: `Mise à jour via analyse IA (${Object.keys(update).join(", ")})`,
  });

  revalidatePath("/loyers");
  revalidatePath(`/locataires`);
  return { error: null, success: true };
}

function parseFrenchDate(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
