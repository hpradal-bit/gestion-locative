"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseLoanFormData } from "./schema";

export type LoanActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer le crédit. Vérifiez les informations puis réessayez.";

export async function createLoan(
  _prevState: LoanActionState,
  formData: FormData
): Promise<LoanActionState> {
  const parsed = parseLoanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/financements");
  revalidatePath("/");
  redirect(`/financements/${data.id}`);
}

export async function updateLoan(
  loanId: string,
  _prevState: LoanActionState,
  formData: FormData
): Promise<LoanActionState> {
  const parsed = parseLoanFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("loans").update(parsed.data).eq("id", loanId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/financements");
  revalidatePath(`/financements/${loanId}`);
  revalidatePath("/");
  redirect(`/financements/${loanId}`);
}

export async function deleteLoan(loanId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", loanId);

  if (error) {
    throw new Error("Impossible de supprimer ce crédit. Réessayez.");
  }

  revalidatePath("/financements");
  revalidatePath("/");
  redirect("/financements");
}
