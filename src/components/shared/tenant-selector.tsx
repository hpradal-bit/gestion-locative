"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/lib/supabase/database.types";

type TenantSelectorProps = {
  name: string;
  tenants: Pick<Tables<"tenants">, "id" | "first_name" | "last_name">[];
  defaultValue?: string;
  onValueChange?: (tenantId: string) => void;
  required?: boolean;
};

export function TenantSelector({
  name,
  tenants,
  defaultValue,
  onValueChange,
  required,
}: TenantSelectorProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      required={required}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un locataire" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.first_name} {tenant.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
