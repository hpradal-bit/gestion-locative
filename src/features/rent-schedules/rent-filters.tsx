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
import type { RentScheduleStatus } from "@/lib/finance";

const STATUS_OPTIONS: { value: RentScheduleStatus; label: string }[] = [
  { value: "late", label: "En retard" },
  { value: "pending", label: "En attente" },
  { value: "partial", label: "Partiellement payé" },
  { value: "paid", label: "Payé" },
];

const ALL = "all";

export function RentFilters({
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
    router.push(`/loyers?${params.toString()}`);
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
        defaultValue={searchParams.get("statut") ?? ALL}
        onValueChange={(value) => updateParam("statut", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les statuts</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
