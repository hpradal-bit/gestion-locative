import { createClient } from "@/lib/supabase/server";

export async function listWorks() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*, properties(id, name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getWork(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("works").select("*").eq("id", id).maybeSingle();
  return data;
}
