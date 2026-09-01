import { createClient } from "@/lib/supabase/server";

export async function listTemplates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("document_templates")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getTemplate(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
