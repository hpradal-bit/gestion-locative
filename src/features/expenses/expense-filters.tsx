"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/lib/supabase/database.types";
import { expenseCategories } from "./schema";
import { EXPENSE_CATEGORY_LABELS } from "./constants";

const ALL = "all";

export function ExpenseFilters({
  properties,
}: {
  properties: Pick<Tables<"properties">, "id" | "name">[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/depenses?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        defaultValue={searchParams.get("bien") ?? ALL}
        onValueChange={(value) => updateParam("bien", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tous les biens" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les biens</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("categorie") ?? ALL}
        onValueChange={(value) => updateParam("categorie", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Toutes les catégories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes les catégories</SelectItem>
          {expenseCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {EXPENSE_CATEGORY_LABELS[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
