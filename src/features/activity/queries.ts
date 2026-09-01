import { createClient } from "@/lib/supabase/server";

export async function listActivityEvents(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
