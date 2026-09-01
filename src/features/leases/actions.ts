"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { generateRentSchedules } from "@/lib/scheduling";
import { parseLeaseFormData } from "./schema";

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
    .select("id, start_date, initial_rent, charges")
    .single();

  if (error || !lease) {
    return { error: GENERIC_ERROR };
  }

  // Les échéances sont dérivées du bail — jamais ressaisies (une information = une source).
  const schedules = generateRentSchedules({
    startDate: new Date(lease.start_date),
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

  // Les échéances déjà générées (parfois déjà payées) ne sont jamais
  // réécrites rétroactivement : un changement de loyer ici ne vaut que
  // pour les informations du bail lui-même, pas pour l'historique des
  // échéances déjà émises.
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
