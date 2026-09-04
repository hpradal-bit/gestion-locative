"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type KpiGroupItem = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
};

type KpiGroupCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  dialogTitle: string;
  dialogDescription?: string;
  items: KpiGroupItem[];
};

const TONE_CLASS: Record<NonNullable<KpiGroupItem["tone"]>, string> = {
  default: "",
  positive: "text-success",
  negative: "text-destructive",
};

/**
 * Carte KPI qui regroupe plusieurs informations liées : la carte affiche un
 * seul chiffre principal, et l'ouvre en dialogue au clic pour le détail —
 * plutôt que d'occuper une carte séparée par métrique sur le dashboard.
 */
export function KpiGroupCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  dialogTitle,
  dialogDescription,
  items,
}: KpiGroupCardProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="cursor-pointer gap-3 rounded-2xl py-5 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md"
      >
        <CardContent className="flex items-start justify-between gap-3 px-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", TONE_CLASS[tone])}>
              {value}
            </p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {dialogDescription && <p className="text-sm text-muted-foreground">{dialogDescription}</p>}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="text-right">
                  <p className={cn("font-medium tabular-nums", TONE_CLASS[item.tone ?? "default"])}>
                    {item.value}
                  </p>
                  {item.hint && <p className="text-xs text-muted-foreground">{item.hint}</p>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
