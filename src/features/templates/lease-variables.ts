import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export async function buildLeaseTemplateVariables(
  leaseId: string
): Promise<Record<string, string> | null> {
  const supabase = await createClient();
  const { data: lease } = await supabase
    .from("leases")
    .select("*, properties(name, address, city), tenants(first_name, last_name)")
    .eq("id", leaseId)
    .maybeSingle();

  if (!lease || !lease.properties || !lease.tenants) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerProfile } = user
    ? await supabase.from("owner_profiles").select("full_name").eq("user_id", user.id).maybeSingle()
    : { data: null };

  return {
    nom_locataire: lease.tenants.last_name,
    prenom_locataire: lease.tenants.first_name,
    nom_proprietaire: ownerProfile?.full_name ?? "",
    nom_bien: lease.properties.name,
    adresse_bien: lease.properties.address ?? "",
    ville_bien: lease.properties.city ?? "",
    loyer: formatCurrency(lease.initial_rent),
    charges: formatCurrency(lease.charges),
    depot_garantie: formatCurrency(lease.security_deposit),
    date_debut_bail: new Date(lease.start_date).toLocaleDateString("fr-FR"),
    date_fin_bail: lease.end_date ? new Date(lease.end_date).toLocaleDateString("fr-FR") : "",
    date_du_jour: new Date().toLocaleDateString("fr-FR"),
  };
}
