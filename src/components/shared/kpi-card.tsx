import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  className?: string;
  /** Rend toute la carte cliquable — pour ramener directement à la page/l'onglet concerné. */
  href?: string;
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
  href,
}: KpiCardProps) {
  const card = (
    <Card
      className={cn(
        "gap-3 rounded-2xl py-5 transition-[transform,box-shadow] duration-150",
        href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md",
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 px-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              tone === "positive" && "text-success",
              tone === "negative" && "text-destructive"
            )}
          >
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
