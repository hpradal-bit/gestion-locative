"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ownerProfileSchema } from "@/features/settings/schema";
import { tenantSchema } from "@/features/tenants/schema";
import { propertySchema } from "@/features/properties/schema";
import { leaseSchema } from "@/features/leases/schema";

export type LeaseReviewData = {
  owner: { full_name: string; address: string; city: string; postal_code: string; email: string; phone: string };
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    birth_date: string;
  };
  property: { id: string; name: string; address: string; city: string; postal_code: string; lot_number: string };
  lease: {
    id: string;
    start_date: string;
    end_date: string;
    lease_type: string;
    irl_index: string;
    initial_rent: number;
    charges: number;
    security_deposit: number;
    next_revision_date: string;
    payment_due_day: number;
    notice_period_months: number;
  };
};

/**
 * Toutes les informations qui alimentent un bail généré, regroupées par
 * fiche d'origine (propriétaire, locataire, bien, bail) — pour les revoir
 * et les corriger au même endroit, avant de générer le document.
 */
export async function getLeaseReviewData(leaseId: string): Promise<LeaseReviewData | null> {
  const supabase = await createClient();

  const { data: lease } = await supabase.from("leases").select("*").eq("id", leaseId).maybeSingle();
  if (!lease) return null;

  const [{ data: tenant }, { data: property }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", lease.tenant_id).maybeSingle(),
    supabase.from("properties").select("*").eq("id", lease.property_id).maybeSingle(),
  ]);
  if (!tenant || !property) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerProfile } = user
    ? await supabase.from("owner_profiles").select("*").eq("user_id", user.id).maybeSingle()
    : { data: null };

  return {
    owner: {
      full_name: ownerProfile?.full_name ?? "",
      address: ownerProfile?.address ?? "",
      city: ownerProfile?.city ?? "",
      postal_code: ownerProfile?.postal_code ?? "",
      email: ownerProfile?.email ?? "",
      phone: ownerProfile?.phone ?? "",
    },
    tenant: {
      id: tenant.id,
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email ?? "",
      phone: tenant.phone ?? "",
      address: tenant.address ?? "",
      birth_date: tenant.birth_date ?? "",
    },
    property: {
      id: property.id,
      name: property.name,
      address: property.address ?? "",
      city: property.city ?? "",
      postal_code: property.postal_code ?? "",
      lot_number: property.lot_number ?? "",
    },
    lease: {
      id: lease.id,
      start_date: lease.start_date,
      end_date: lease.end_date ?? "",
      lease_type: lease.lease_type ?? "",
      irl_index: lease.irl_index ?? "",
      initial_rent: lease.initial_rent,
      charges: lease.charges,
      security_deposit: lease.security_deposit,
      next_revision_date: lease.next_revision_date ?? "",
      payment_due_day: lease.payment_due_day,
      notice_period_months: lease.notice_period_months,
    },
  };
}

export type SaveLeaseReviewState = { error: string | null; success?: boolean };

function extract(formData: FormData, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(prefix) && typeof value === "string") {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}

/**
 * Enregistre en une seule fois les modifications faites depuis l'écran de
 * relecture d'un bail — chaque section met à jour sa propre fiche
 * (propriétaire, locataire, bien, bail), avec la validation habituelle.
 */
export async function saveLeaseReviewData(
  leaseId: string,
  tenantId: string,
  propertyId: string,
  _prevState: SaveLeaseReviewState,
  formData: FormData
): Promise<SaveLeaseReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerParsed = ownerProfileSchema
    .pick({ full_name: true, address: true, city: true, postal_code: true, email: true, phone: true })
    .safeParse(extract(formData, "owner_"));
  const tenantParsed = tenantSchema
    .pick({ first_name: true, last_name: true, email: true, phone: true, address: true, birth_date: true })
    .safeParse(extract(formData, "tenant_"));
  const propertyParsed = propertySchema
    .pick({ name: true, address: true, city: true, postal_code: true, lot_number: true })
    .safeParse(extract(formData, "property_"));
  const leaseParsed = leaseSchema
    .pick({
      start_date: true,
      end_date: true,
      lease_type: true,
      irl_index: true,
      initial_rent: true,
      charges: true,
      security_deposit: true,
      next_revision_date: true,
      payment_due_day: true,
      notice_period_months: true,
    })
    .safeParse(extract(formData, "lease_"));

  const firstError =
    ownerParsed.error?.issues[0]?.message ??
    tenantParsed.error?.issues[0]?.message ??
    propertyParsed.error?.issues[0]?.message ??
    leaseParsed.error?.issues[0]?.message;
  if (firstError) {
    return { error: firstError };
  }
  if (!ownerParsed.success || !tenantParsed.success || !propertyParsed.success || !leaseParsed.success || !user) {
    return { error: "Impossible d'enregistrer les modifications. Réessayez." };
  }

  const [ownerResult, tenantResult, propertyResult, leaseResult] = await Promise.all([
    supabase.from("owner_profiles").upsert({ user_id: user.id, ...ownerParsed.data }),
    supabase.from("tenants").update(tenantParsed.data).eq("id", tenantId),
    supabase.from("properties").update(propertyParsed.data).eq("id", propertyId),
    supabase.from("leases").update(leaseParsed.data).eq("id", leaseId),
  ]);

  if (ownerResult.error || tenantResult.error || propertyResult.error || leaseResult.error) {
    return { error: "Impossible d'enregistrer les modifications. Réessayez." };
  }

  revalidatePath("/baux");
  revalidatePath(`/locataires/${tenantId}`);
  revalidatePath(`/biens/${propertyId}`);
  revalidatePath("/parametres/proprietaire");

  return { error: null, success: true };
}
