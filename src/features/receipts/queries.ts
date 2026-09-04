import { createClient } from "@/lib/supabase/server";
import { computeRentScheduleStatus } from "@/lib/finance";
import type { ReceiptData } from "./receipt-document";

export async function getReceiptData(scheduleId: string): Promise<ReceiptData | null> {
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("rent_schedules")
    .select("*, leases(id, properties(name, address, city), tenants(first_name, last_name, email))")
    .eq("id", scheduleId)
    .maybeSingle();

  if (!schedule || !schedule.leases) return null;

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("rent_schedule_id", scheduleId)
    .order("paid_at", { ascending: false });

  const paymentRows = payments ?? [];
  const totalDue = schedule.rent_amount + schedule.charges_amount;
  const totalPaid = paymentRows.reduce((sum, p) => sum + p.amount, 0);
  const status = computeRentScheduleStatus({
    dueDate: new Date(schedule.due_date),
    totalDue,
    totalPaid,
  });

  if (status !== "paid") return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerProfile } = user
    ? await supabase.from("owner_profiles").select("*").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const property = schedule.leases.properties;
  const tenant = schedule.leases.tenants;

  return {
    owner: {
      fullName: ownerProfile?.full_name ?? user?.email ?? "Propriétaire",
      address: ownerProfile?.address ?? null,
    },
    tenant: {
      fullName: tenant ? `${tenant.first_name} ${tenant.last_name}` : "Locataire",
      email: tenant?.email ?? null,
    },
    property: {
      name: property?.name ?? "Bien",
      address: property?.address ?? null,
      city: property?.city ?? null,
    },
    period: { dueDate: schedule.due_date },
    rentAmount: schedule.rent_amount,
    chargesAmount: schedule.charges_amount,
    totalAmount: totalPaid,
    paidAt: paymentRows[0]?.paid_at ?? schedule.due_date,
  };
}
