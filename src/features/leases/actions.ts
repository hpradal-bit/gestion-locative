"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { dateAtDay, generateRentSchedules } from "@/lib/scheduling";
import { logActivity } from "@/features/activity/log";
import { parseLeaseFormData } from "./schema";

/**
 * Réaligne le jour d'échéance des échéances futures et non payées sur le
 * nouveau jour de paiement convenu avec le locataire. Les échéances déjà
 * réglées (même partiellement) ne sont jamais touchées : seul un jour
 * d'échéance pas encore honoré peut être corrigé.
 */
async function realignFutureUnpaidSchedules(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leaseId: string,
  paymentDueDay: number
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("id, due_date")
    .eq("lease_id", leaseId)
    .gte("due_date", today);

  if (!schedules || schedules.length === 0) return;

  const { data: payments } = await supabase
    .from("payments")
    .select("rent_schedule_id")
    .in(
      "rent_schedule_id",
      schedules.map((s) => s.id)
    );
  const paidScheduleIds = new Set((payments ?? []).map((p) => p.rent_schedule_id));

  for (const schedule of schedules) {
    if (paidScheduleIds.has(schedule.id)) continue;
    const correctedDueDate = dateAtDay(new Date(schedule.due_date), 0, paymentDueDay)
      .toISOString()
      .slice(0, 10);
    if (correctedDueDate === schedule.due_date) continue;
    await supabase
      .from("rent_schedules")
      .update({ due_date: correctedDueDate })
      .eq("id", schedule.id);
  }
}

async function describeLease(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  propertyId: string
): Promise<string> {
  const [{ data: tenant }, { data: property }] = await Promise.all([
    supabase.from("tenants").select("first_name, last_name").eq("id", tenantId).maybeSingle(),
    supabase.from("properties").select("name").eq("id", propertyId).maybeSingle(),
  ]);
  const tenantLabel = tenant ? `${tenant.first_name} ${tenant.last_name}` : "Locataire";
  return `${tenantLabel} — ${property?.name ?? "Bien"}`;
}

export type LeaseActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer le bail. Vérifiez les informations puis réessayez.";

const INITIAL_SCHEDULE_COUNT = 12;

export async function createLease(
  tenantId: string,
  _prevState: LeaseActionState,
  formData: FormData
): Promise<LeaseActionState> {
  const parsed = parseLeaseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: lease, error } = await supabase
    .from("leases")
    .insert(parsed.data)
    .select("id, start_date, initial_rent, charges, payment_due_day")
    .single();

  if (error || !lease) {
    return { error: GENERIC_ERROR };
  }

  // Les échéances sont dérivées du bail — jamais ressaisies (une information = une source).
  const schedules = generateRentSchedules({
    startDate: new Date(lease.start_date),
    paymentDueDay: lease.payment_due_day,
    rentAmount: lease.initial_rent,
    chargesAmount: lease.charges,
    count: INITIAL_SCHEDULE_COUNT,
  }).map((schedule) => ({ ...schedule, lease_id: lease.id }));

  const { error: scheduleError } = await supabase.from("rent_schedules").insert(schedules);
  if (scheduleError) {
    return {
      error:
        "Le bail a été créé mais les échéances n'ont pas pu être générées. Contactez le support.",
    };
  }

  await logActivity({
    action: "lease_created",
    entityLabel: await describeLease(supabase, tenantId, parsed.data.property_id),
  });

  revalidatePath("/loyers");
  revalidatePath(`/locataires/${tenantId}`);
  revalidatePath(`/biens/${parsed.data.property_id}`);
  redirect(`/locataires/${tenantId}`);
}

export async function updateLease(
  leaseId: string,
  tenantId: string,
  _prevState: LeaseActionState,
  formData: FormData
): Promise<LeaseActionState> {
  const parsed = parseLeaseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leases").update(parsed.data).eq("id", leaseId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  // Le jour d'échéance des échéances futures et non payées suit le nouveau
  // jour de paiement convenu. Les échéances déjà réglées (même
  // partiellement) ne sont jamais réécrites rétroactivement.
  await realignFutureUnpaidSchedules(supabase, leaseId, parsed.data.payment_due_day);

  await logActivity({
    action: "lease_updated",
    entityLabel: await describeLease(supabase, tenantId, parsed.data.property_id),
  });

  revalidatePath("/loyers");
  revalidatePath(`/locataires/${tenantId}`);
  revalidatePath(`/biens/${parsed.data.property_id}`);
  redirect(`/locataires/${tenantId}`);
}

export async function endLease(leaseId: string, tenantId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leases")
    .update({ status: "ended", end_date: new Date().toISOString().slice(0, 10) })
    .eq("id", leaseId);

  if (error) {
    throw new Error("Impossible de mettre fin à ce bail. Réessayez.");
  }

  revalidatePath(`/locataires/${tenantId}`);
}

export async function deleteLease(leaseId: string, tenantId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("leases").delete().eq("id", leaseId);

  if (error) {
    throw new Error("Impossible de supprimer ce bail. Réessayez.");
  }

  revalidatePath(`/locataires/${tenantId}`);
}
