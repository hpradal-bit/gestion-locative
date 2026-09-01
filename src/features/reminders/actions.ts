"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getEmailProvider } from "@/lib/notifications/resend-provider";
import { logActivity } from "@/features/activity/log";
import { buildReminderMessage, type ReminderLevel } from "./templates";

export type ReminderActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR = "Impossible d'envoyer la relance. Vérifiez les informations puis réessayez.";

export async function sendReminder(
  _prevState: ReminderActionState,
  formData: FormData
): Promise<ReminderActionState> {
  const scheduleId = formData.get("rent_schedule_id");
  const levelRaw = formData.get("level");

  if (typeof scheduleId !== "string" || typeof levelRaw !== "string") {
    return { error: GENERIC_ERROR };
  }
  const level = Number(levelRaw) as ReminderLevel;
  if (![1, 2, 3].includes(level)) {
    return { error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("rent_schedules")
    .select("*, leases(properties(name), tenants(first_name, last_name, email))")
    .eq("id", scheduleId)
    .maybeSingle();

  const tenant = schedule?.leases?.tenants;
  const property = schedule?.leases?.properties;

  if (!schedule || !tenant || !property) {
    return { error: GENERIC_ERROR };
  }

  if (!tenant.email) {
    return { error: "Ce locataire n'a pas d'adresse email enregistrée." };
  }

  const { subject, body } = buildReminderMessage(level, {
    tenantName: `${tenant.first_name} ${tenant.last_name}`,
    propertyName: property.name,
    amount: schedule.rent_amount + schedule.charges_amount,
    dueDate: schedule.due_date,
  });

  const provider = getEmailProvider();
  const result = await provider.sendEmail({
    to: tenant.email,
    subject,
    html: body.replace(/\n/g, "<br />"),
  });

  await supabase.from("reminders").insert({
    rent_schedule_id: scheduleId,
    level,
    channel: "email",
    subject,
    message: body,
    status: result.success ? "sent" : "failed",
    error: result.error ?? null,
  });

  revalidatePath("/notifications");
  revalidatePath("/loyers");

  if (!result.success) {
    return { error: result.error ?? GENERIC_ERROR };
  }

  await logActivity({
    action: "reminder_sent",
    entityLabel: `${tenant.first_name} ${tenant.last_name} — ${property.name} — ${schedule.due_date}`,
    metadata: { level, amount: schedule.rent_amount + schedule.charges_amount },
  });

  return { error: null, success: true };
}
