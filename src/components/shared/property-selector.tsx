"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/lib/supabase/database.types";

type PropertySelectorProps = {
  name: string;
  properties: Pick<Tables<"properties">, "id" | "name" | "city">[];
  defaultValue?: string;
  onValueChange?: (propertyId: string) => void;
  required?: boolean;
};

export function PropertySelector({
  name,
  properties,
  defaultValue,
  onValueChange,
  required,
}: PropertySelectorProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      required={required}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un bien" />
      </SelectTrigger>
      <SelectContent>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name}
            {property.city ? ` — ${property.city}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
