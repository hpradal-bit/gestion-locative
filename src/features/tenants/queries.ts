import { createClient } from "@/lib/supabase/server";

export async function listTenants() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getTenant(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("tenants").select("*").eq("id", id).maybeSingle();
  return data;
}
