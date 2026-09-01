"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parsePaymentFormData } from "./schema";

export type PaymentActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR =
  "Impossible d'enregistrer le paiement. Vérifiez les informations puis réessayez.";

export async function recordPayment(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const parsed = parsePaymentFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  // RLS garantit que l'échéance appartient bien à l'utilisateur courant.
  const { error } = await supabase.from("payments").insert(parsed.data);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/loyers");
  revalidatePath("/");
  return { error: null, success: true };
}

/**
 * Valide en une fois plusieurs échéances comme intégralement payées. Le
 * montant restant dû est toujours recalculé côté serveur à partir des
 * paiements déjà enregistrés — jamais un montant fourni par le client.
 */
export async function recordBulkPayments(formData: FormData): Promise<void> {
  const scheduleIds = formData.getAll("scheduleIds").filter((id): id is string => typeof id === "string");
  if (scheduleIds.length === 0) return;

  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("id, rent_amount, charges_amount")
    .in("id", scheduleIds);

  if (!schedules || schedules.length === 0) return;

  const { data: payments } = await supabase
    .from("payments")
    .select("rent_schedule_id, amount")
    .in("rent_schedule_id", scheduleIds);

  const paidByScheduleId = new Map<string, number>();
  for (const payment of payments ?? []) {
    paidByScheduleId.set(
      payment.rent_schedule_id,
      (paidByScheduleId.get(payment.rent_schedule_id) ?? 0) + payment.amount
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const newPayments = schedules
    .map((schedule) => {
      const totalDue = schedule.rent_amount + schedule.charges_amount;
      const remaining = totalDue - (paidByScheduleId.get(schedule.id) ?? 0);
      return { rent_schedule_id: schedule.id, amount: remaining, paid_at: today };
    })
    .filter((payment) => payment.amount > 0);

  if (newPayments.length === 0) return;

  // RLS garantit que chaque échéance appartient bien à l'utilisateur courant.
  await supabase.from("payments").insert(newPayments);

  revalidatePath("/loyers");
  revalidatePath("/");
}
