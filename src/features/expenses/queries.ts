import { createClient } from "@/lib/supabase/server";
import type { expenseCategories } from "./schema";

export type ExpenseFilters = {
  propertyId?: string;
  category?: (typeof expenseCategories)[number];
};

export async function listExpenses(filters: ExpenseFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select("*, properties(id, name)")
    .order("expense_date", { ascending: false });

  if (filters.propertyId) query = query.eq("property_id", filters.propertyId);
  if (filters.category) query = query.eq("category", filters.category);

  const { data } = await query;
  return data ?? [];
}

export async function getExpense(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*").eq("id", id).maybeSingle();
  return data;
}
