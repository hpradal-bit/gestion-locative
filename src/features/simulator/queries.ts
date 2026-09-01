import { createClient } from "@/lib/supabase/server";
import type { SimulationInput } from "@/lib/finance";

export type SavedSimulation = {
  id: string;
  name: string;
  input: SimulationInput;
  created_at: string;
  updated_at: string;
};

export async function listSimulations(): Promise<SavedSimulation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("simulations")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data ?? []) as unknown as SavedSimulation[];
}

export async function getSimulation(id: string): Promise<SavedSimulation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("simulations").select("*").eq("id", id).maybeSingle();
  return data as unknown as SavedSimulation | null;
}
