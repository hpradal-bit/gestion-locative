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

export type LastReminderInfo = { created_at: string; level: number; status: string };

/** La relance la plus récente par échéance — pour éviter de relancer inutilement. */
export async function getLastRemindersByScheduleIds(
  scheduleIds: string[]
): Promise<Map<string, LastReminderInfo>> {
  if (scheduleIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase
    .from("reminders")
    .select("rent_schedule_id, created_at, level, status")
    .in("rent_schedule_id", scheduleIds)
    .order("created_at", { ascending: false });

  const map = new Map<string, LastReminderInfo>();
  for (const reminder of data ?? []) {
    if (!map.has(reminder.rent_schedule_id)) {
      map.set(reminder.rent_schedule_id, {
        created_at: reminder.created_at,
        level: reminder.level,
        status: reminder.status,
      });
    }
  }
  return map;
}
