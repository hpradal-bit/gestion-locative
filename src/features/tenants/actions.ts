"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseTenantFormData } from "./schema";

export type TenantActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer le locataire. Vérifiez les informations puis réessayez.";

export async function createTenant(
  _prevState: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const parsed = parseTenantFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/locataires");
  redirect(`/locataires/${data.id}`);
}

export async function updateTenant(
  tenantId: string,
  _prevState: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const parsed = parseTenantFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tenants").update(parsed.data).eq("id", tenantId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/locataires");
  revalidatePath(`/locataires/${tenantId}`);
  redirect(`/locataires/${tenantId}`);
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tenants").delete().eq("id", tenantId);

  if (error) {
    throw new Error(
      "Impossible de supprimer ce locataire. Vérifiez qu'aucun bail n'y est encore rattaché."
    );
  }

  revalidatePath("/locataires");
  redirect("/locataires");
}
