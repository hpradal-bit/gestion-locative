"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseExpenseFormData } from "./schema";

export type ExpenseActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer la dépense. Vérifiez les informations puis réessayez.";

export async function createExpense(
  _prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const parsed = parseExpenseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert(parsed.data);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/depenses");
  revalidatePath("/");
  redirect("/depenses");
}

export async function updateExpense(
  expenseId: string,
  _prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const parsed = parseExpenseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").update(parsed.data).eq("id", expenseId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  revalidatePath("/depenses");
  revalidatePath("/");
  redirect("/depenses");
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    throw new Error("Impossible de supprimer cette dépense. Réessayez.");
  }

  revalidatePath("/depenses");
  revalidatePath("/");
}
