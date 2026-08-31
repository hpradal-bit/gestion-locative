"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseWorkFormData } from "./schema";

export type WorkActionState = { error: string | null };

const GENERIC_ERROR =
  "Impossible d'enregistrer le chantier. Vérifiez les informations puis réessayez.";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type WorkRow = {
  id: string;
  property_id: string;
  description: string;
  company: string | null | undefined;
  actual_amount: number | null | undefined;
  start_date: string | null | undefined;
  end_date: string | null | undefined;
  status: string;
};

/**
 * Un chantier terminé/payé avec un montant réel alimente automatiquement les
 * dépenses (une information, une source) — jamais ressaisi manuellement.
 * La dépense générée est retirée si le chantier redevient en cours ou si son
 * montant réel est effacé, pour rester toujours synchronisée avec le chantier.
 */
async function syncWorkExpense(supabase: SupabaseClient, work: WorkRow) {
  const shouldHaveExpense =
    (work.status === "termine" || work.status === "paye") &&
    typeof work.actual_amount === "number" &&
    work.actual_amount > 0;

  const { data: existing } = await supabase
    .from("expenses")
    .select("id")
    .eq("work_id", work.id)
    .maybeSingle();

  if (shouldHaveExpense) {
    const payload = {
      property_id: work.property_id,
      category: "travaux" as const,
      amount: work.actual_amount!,
      expense_date: work.end_date || work.start_date || new Date().toISOString().slice(0, 10),
      description: work.description,
      supplier: work.company || null,
      is_recurring: false,
      work_id: work.id,
    };
    if (existing) {
      await supabase.from("expenses").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("expenses").insert(payload);
    }
  } else if (existing) {
    await supabase.from("expenses").delete().eq("id", existing.id);
  }
}

export async function createWork(
  _prevState: WorkActionState,
  formData: FormData
): Promise<WorkActionState> {
  const parsed = parseWorkFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: work, error } = await supabase
    .from("works")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error || !work) {
    return { error: GENERIC_ERROR };
  }

  await syncWorkExpense(supabase, work);

  revalidatePath("/travaux");
  revalidatePath("/depenses");
  redirect("/travaux");
}

export async function updateWork(
  workId: string,
  _prevState: WorkActionState,
  formData: FormData
): Promise<WorkActionState> {
  const parsed = parseWorkFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: work, error } = await supabase
    .from("works")
    .update(parsed.data)
    .eq("id", workId)
    .select("*")
    .single();

  if (error || !work) {
    return { error: GENERIC_ERROR };
  }

  await syncWorkExpense(supabase, work);

  revalidatePath("/travaux");
  revalidatePath("/depenses");
  redirect("/travaux");
}

export async function deleteWork(workId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("works").delete().eq("id", workId);

  if (error) {
    throw new Error("Impossible de supprimer ce chantier. Réessayez.");
  }

  revalidatePath("/travaux");
  revalidatePath("/depenses");
}
