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

export async function getLease(leaseId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("leases").select("*").eq("id", leaseId).maybeSingle();
  return data;
}

/** Baux actifs, tous locataires confondus — pour choisir un bail lors de la génération d'un document. */
export async function getActiveLeasesForDocuments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select("id, tenants(first_name, last_name), properties(name)")
    .eq("status", "active")
    .order("start_date", { ascending: false });
  return data ?? [];
}
