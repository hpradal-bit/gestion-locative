import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Tables } from "@/lib/supabase/database.types";

export function TenantCard({ tenant }: { tenant: Tables<"tenants"> }) {
  const initials = `${tenant.first_name.charAt(0)}${tenant.last_name.charAt(0)}`.toUpperCase();

  return (
    <Link href={`/locataires/${tenant.id}`}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials || <User className="size-4" />}</AvatarFallback>
          </Avatar>
          <p className="font-semibold leading-tight">
            {tenant.first_name} {tenant.last_name}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          {tenant.email && (
            <span className="flex items-center gap-2">
              <Mail className="size-3.5" />
              {tenant.email}
            </span>
          )}
          {tenant.phone && (
            <span className="flex items-center gap-2">
              <Phone className="size-3.5" />
              {tenant.phone}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
