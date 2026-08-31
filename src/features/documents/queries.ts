import { createClient } from "@/lib/supabase/server";
import type { documentEntityTypes } from "./schema";

export type DocumentFilters = {
  entityType?: (typeof documentEntityTypes)[number];
  search?: string;
};

export async function listDocuments(filters: DocumentFilters = {}) {
  const supabase = await createClient();
  let query = supabase.from("documents").select("*").order("created_at", { ascending: false });

  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.search) query = query.ilike("file_name", `%${filters.search}%`);

  const { data } = await query;
  return data ?? [];
}

export async function listDocumentsForEntity(
  entityType: (typeof documentEntityTypes)[number],
  entityId: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
