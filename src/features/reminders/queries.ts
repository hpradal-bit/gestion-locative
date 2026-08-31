import { createClient } from "@/lib/supabase/server";

export async function listReminders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reminders")
    .select("*, rent_schedules(due_date, leases(properties(name), tenants(first_name, last_name)))")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
