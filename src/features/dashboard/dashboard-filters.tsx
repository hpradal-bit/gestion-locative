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

const ALL = "all";

export function DashboardFilters({
  properties,
}: {
  properties: Pick<Tables<"properties">, "id" | "name">[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete("bien");
    } else {
      params.set("bien", value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <Select
      defaultValue={searchParams.get("bien") ?? ALL}
      onValueChange={updateParam}
    >
      <SelectTrigger className="w-[220px]">
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
  );
}
