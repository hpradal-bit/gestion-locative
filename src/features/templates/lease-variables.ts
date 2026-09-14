import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { LEASE_TYPE_LABELS, leaseTypes } from "@/features/leases/schema";

export async function buildLeaseTemplateVariables(
  leaseId: string
): Promise<Record<string, string> | null> {
  const supabase = await createClient();
  const { data: lease } = await supabase
    .from("leases")
    .select(
      "*, properties(name, address, city, postal_code, lot_number), tenants(first_name, last_name, email, phone, address, birth_date)"
    )
    .eq("id", leaseId)
    .maybeSingle();

  if (!lease || !lease.properties || !lease.tenants) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerProfile } = user
    ? await supabase
        .from("owner_profiles")
        .select("full_name, address, city, postal_code, email, phone")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const ownerAddressParts = [
    ownerProfile?.address,
    [ownerProfile?.postal_code, ownerProfile?.city].filter(Boolean).join(" "),
  ].filter(Boolean);

  const leaseType = leaseTypes.find((type) => type === lease.lease_type);

  return {
    nom_locataire: lease.tenants.last_name,
    prenom_locataire: lease.tenants.first_name,
    email_locataire: lease.tenants.email ?? "",
    telephone_locataire: lease.tenants.phone ?? "",
    adresse_locataire: lease.tenants.address ?? "",
    date_naissance_locataire: lease.tenants.birth_date
      ? new Date(lease.tenants.birth_date).toLocaleDateString("fr-FR")
      : "",
    nom_proprietaire: ownerProfile?.full_name ?? "",
    email_proprietaire: ownerProfile?.email ?? "",
    telephone_proprietaire: ownerProfile?.phone ?? "",
    adresse_proprietaire: ownerAddressParts.join(", "),
    nom_bien: lease.properties.name,
    adresse_bien: lease.properties.address ?? "",
    ville_bien: lease.properties.city ?? "",
    code_postal_bien: lease.properties.postal_code ?? "",
    numero_lot: lease.properties.lot_number ?? "",
    type_bail: leaseType ? LEASE_TYPE_LABELS[leaseType] : "",
    nombre_cles: lease.keys_count !== null ? String(lease.keys_count) : "",
    nombre_badges: lease.badges_count !== null ? String(lease.badges_count) : "",
    ville_signature: lease.signature_city ?? "",
    loyer: formatCurrency(lease.initial_rent),
    charges: formatCurrency(lease.charges),
    depot_garantie: formatCurrency(lease.security_deposit),
    jour_paiement_loyer: String(lease.payment_due_day),
    indice_irl: lease.irl_index ?? "",
    prochaine_revision_loyer: lease.next_revision_date
      ? new Date(lease.next_revision_date).toLocaleDateString("fr-FR")
      : "",
    date_debut_bail: new Date(lease.start_date).toLocaleDateString("fr-FR"),
    date_fin_bail: lease.end_date ? new Date(lease.end_date).toLocaleDateString("fr-FR") : "",
    date_du_jour: new Date().toLocaleDateString("fr-FR"),
  };
}
