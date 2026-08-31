import { createClient } from "@/lib/supabase/server";

export async function getLeasesForTenant(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select("*, properties(id, name, city)")
    .eq("tenant_id", tenantId)
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function getLeasesForProperty(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select("*, tenants(id, first_name, last_name)")
    .eq("property_id", propertyId)
    .order("start_date", { ascending: false });
  return data ?? [];
}
