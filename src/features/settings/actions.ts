"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseOwnerProfileFormData } from "./schema";

export type OwnerProfileActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR =
  "Impossible d'enregistrer le profil. Vérifiez les informations puis réessayez.";

export async function saveOwnerProfile(
  _prevState: OwnerProfileActionState,
  formData: FormData
): Promise<OwnerProfileActionState> {
  const parsed = parseOwnerProfileFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const { error } = await supabase
    .from("owner_profiles")
    .upsert({ user_id: user.id, ...parsed.data });

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/parametres/proprietaire");
  return { error: null, success: true };
}
