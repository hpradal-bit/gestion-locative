"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/features/activity/log";
import type { SimulationInput } from "@/lib/finance";
import type { Json } from "@/lib/supabase/database.types";
import { simulationNameSchema } from "./schema";

export type SimulationActionState = { error: string | null; id?: string };

const GENERIC_ERROR = "Impossible d'enregistrer la simulation. Réessayez.";

// Ces actions sont appelées directement (pas via <form action>) depuis un
// composant client, qui gère lui-même la navigation post-succès via
// useRouter — plus explicite et plus sûr que de compter sur le
// comportement de redirect() lors d'un appel direct d'une Server Action.
export async function createSimulation(
  name: string,
  input: SimulationInput
): Promise<SimulationActionState> {
  const parsedName = simulationNameSchema.safeParse(name);
  if (!parsedName.success) {
    return { error: parsedName.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simulations")
    .insert({ name: parsedName.data, input: input as unknown as Json })
    .select("id")
    .single();

  if (error || !data) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({ action: "simulation_created", entityLabel: parsedName.data });

  revalidatePath("/simulateur");
  return { error: null, id: data.id };
}

export async function updateSimulation(
  simulationId: string,
  name: string,
  input: SimulationInput
): Promise<SimulationActionState> {
  const parsedName = simulationNameSchema.safeParse(name);
  if (!parsedName.success) {
    return { error: parsedName.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("simulations")
    .update({
      name: parsedName.data,
      input: input as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", simulationId);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  await logActivity({ action: "simulation_updated", entityLabel: parsedName.data });

  revalidatePath("/simulateur");
  revalidatePath(`/simulateur/${simulationId}`);
  return { error: null, id: simulationId };
}

// Invoquée via <form action> (voir saved-simulations-list.tsx) : redirect()
// y est sûr et cohérent avec deleteProperty/deleteLease/deleteSimulation.
export async function duplicateSimulation(simulationId: string): Promise<void> {
  const supabase = await createClient();
  const { data: original } = await supabase
    .from("simulations")
    .select("name, input")
    .eq("id", simulationId)
    .maybeSingle();

  if (!original) return;

  const { data, error } = await supabase
    .from("simulations")
    .insert({ name: `${original.name} (copie)`, input: original.input })
    .select("id")
    .single();

  if (error || !data) return;

  await logActivity({
    action: "simulation_created",
    entityLabel: `${original.name} (copie)`,
  });

  revalidatePath("/simulateur");
  redirect(`/simulateur/${data.id}`);
}

export async function deleteSimulation(simulationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("simulations").delete().eq("id", simulationId);

  if (error) {
    throw new Error("Impossible de supprimer cette simulation. Réessayez.");
  }

  revalidatePath("/simulateur");
  redirect("/simulateur");
}
