import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type SignerRole = "owner" | "tenant";

export type SignatureRequestForToken = {
  request: Tables<"signature_requests">;
  role: SignerRole;
};

/**
 * Retrouve une demande de signature à partir du jeton d'un signataire —
 * accessible sans authentification, c'est le jeton lui-même qui fait foi.
 */
export async function getSignatureRequestByToken(
  token: string
): Promise<SignatureRequestForToken | null> {
  const supabase = createAdminClient();

  const { data: byOwner } = await supabase
    .from("signature_requests")
    .select("*")
    .eq("owner_token", token)
    .maybeSingle();
  if (byOwner) return { request: byOwner, role: "owner" };

  const { data: byTenant } = await supabase
    .from("signature_requests")
    .select("*")
    .eq("tenant_token", token)
    .maybeSingle();
  if (byTenant) return { request: byTenant, role: "tenant" };

  return null;
}

/** Demandes de signature d'un bail, les plus récentes en premier. */
export async function getSignatureRequestsForLease(leaseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("signature_requests")
    .select("*")
    .eq("lease_id", leaseId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
