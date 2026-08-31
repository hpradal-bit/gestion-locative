import { createClient } from "@/lib/supabase/server";
import { computeRentScheduleStatus } from "@/lib/finance";
import type { RentScheduleFilters, RentScheduleWithDetails } from "./types";

export async function listRentSchedules(
  filters: RentScheduleFilters = {}
): Promise<RentScheduleWithDetails[]> {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("*, leases(id, properties(id, name), tenants(id, first_name, last_name))")
    .order("due_date", { ascending: false });

  const scheduleRows = schedules ?? [];
  if (scheduleRows.length === 0) return [];

  const scheduleIds = scheduleRows.map((s) => s.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .in("rent_schedule_id", scheduleIds)
    .order("paid_at", { ascending: false });
  const paymentRows = payments ?? [];

  const paymentsByScheduleId = new Map<string, typeof paymentRows>();
  for (const payment of paymentRows) {
    const list = paymentsByScheduleId.get(payment.rent_schedule_id) ?? [];
    list.push(payment);
    paymentsByScheduleId.set(payment.rent_schedule_id, list);
  }

  const now = new Date();
  const result: RentScheduleWithDetails[] = scheduleRows.map((schedule) => {
    const lease = schedule.leases;
    const property = lease?.properties ?? null;
    const tenant = lease?.tenants ?? null;
    const schedulePayments = paymentsByScheduleId.get(schedule.id) ?? [];
    const totalDue = schedule.rent_amount + schedule.charges_amount;
    const totalPaid = schedulePayments.reduce((sum, p) => sum + p.amount, 0);
    const status = computeRentScheduleStatus({
      dueDate: new Date(schedule.due_date),
      totalDue,
      totalPaid,
      today: now,
    });

    return {
      ...schedule,
      status,
      totalDue,
      totalPaid,
      propertyId: property?.id ?? null,
      propertyName: property?.name ?? "Bien supprimé",
      tenantName: tenant ? `${tenant.first_name} ${tenant.last_name}` : "Locataire supprimé",
      leaseId: lease?.id ?? "",
      payments: schedulePayments,
    };
  });

  return result.filter((row) => {
    if (filters.propertyId && row.propertyId !== filters.propertyId) return false;
    if (filters.status && row.status !== filters.status) return false;
    return true;
  });
}
