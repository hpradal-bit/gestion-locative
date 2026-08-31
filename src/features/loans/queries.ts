import { createClient } from "@/lib/supabase/server";

export async function listLoans() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("*, properties(id, name)")
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function getLoan(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("*, properties(id, name)")
    .eq("id", id)
    .maybeSingle();
  return data;
}
