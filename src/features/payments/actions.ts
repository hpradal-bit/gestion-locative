"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parsePaymentFormData } from "./schema";

export type PaymentActionState = { error: string | null; success?: boolean };

const GENERIC_ERROR =
  "Impossible d'enregistrer le paiement. Vérifiez les informations puis réessayez.";

export async function recordPayment(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const parsed = parsePaymentFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  // RLS garantit que l'échéance appartient bien à l'utilisateur courant.
  const { error } = await supabase.from("payments").insert(parsed.data);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/loyers");
  revalidatePath("/");
  return { error: null, success: true };
}
