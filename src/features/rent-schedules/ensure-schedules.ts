import { createClient } from "@/lib/supabase/server";
import { dateAtDay } from "@/lib/scheduling";

const HORIZON_MONTHS = 1;

/**
 * L'application n'a pas de tâche planifiée (budget 0 €/mois, pas de worker
 * dédié) : les échéances de loyer ne sont donc jamais générées "toutes
 * seules" avec le temps qui passe. Cette fonction comble ce vide à chaque
 * chargement de l'espace applicatif — pour chaque bail actif, elle
 * prolonge la suite d'échéances jusqu'à `HORIZON_MONTHS` mois dans le
 * futur (un seul mois d'avance, jamais plus), en repartant de la dernière
 * échéance connue et en utilisant le loyer/jour de paiement actuels du
 * bail. Idempotente : ne fait rien si la couverture est déjà suffisante.
 */
export async function ensureUpcomingRentSchedules(): Promise<void> {
  const supabase = await createClient();

  const { data: leases } = await supabase
    .from("leases")
    .select("id, initial_rent, charges, payment_due_day")
    .eq("status", "active");

  if (!leases || leases.length === 0) return;

  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("lease_id, due_date")
    .in(
      "lease_id",
      leases.map((lease) => lease.id)
    );

  const lastDueDateByLease = new Map<string, string>();
  for (const schedule of schedules ?? []) {
    const current = lastDueDateByLease.get(schedule.lease_id);
    if (!current || schedule.due_date > current) {
      lastDueDateByLease.set(schedule.lease_id, schedule.due_date);
    }
  }

  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + HORIZON_MONTHS);

  const newSchedules: {
    lease_id: string;
    due_date: string;
    rent_amount: number;
    charges_amount: number;
  }[] = [];

  for (const lease of leases) {
    // Un bail actif possède toujours au moins une échéance (générée à sa
    // création) — sans point de départ connu, on ne peut pas deviner une
    // date de reprise fiable, donc on ignore ce cas anormal plutôt que de
    // risquer une échéance mal placée.
    const lastDueDate = lastDueDateByLease.get(lease.id);
    if (!lastDueDate) continue;

    let cursor = new Date(lastDueDate);
    while (true) {
      const next = dateAtDay(cursor, 1, lease.payment_due_day);
      if (next > horizon) break;
      newSchedules.push({
        lease_id: lease.id,
        due_date: next.toISOString().slice(0, 10),
        rent_amount: lease.initial_rent,
        charges_amount: lease.charges,
      });
      cursor = next;
    }
  }

  if (newSchedules.length > 0) {
    await supabase.from("rent_schedules").insert(newSchedules);
  }
}
