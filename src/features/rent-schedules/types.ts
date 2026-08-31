import type { RentScheduleStatus } from "@/lib/finance";
import type { Tables } from "@/lib/supabase/database.types";

export type RentScheduleWithDetails = Tables<"rent_schedules"> & {
  status: RentScheduleStatus;
  totalDue: number;
  totalPaid: number;
  propertyId: string | null;
  propertyName: string;
  tenantName: string;
  leaseId: string;
  payments: Tables<"payments">[];
};

export type RentScheduleFilters = {
  propertyId?: string;
  status?: RentScheduleStatus;
};
