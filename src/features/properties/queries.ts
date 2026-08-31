import { createClient } from "@/lib/supabase/server";

export async function listProperties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProperty(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
