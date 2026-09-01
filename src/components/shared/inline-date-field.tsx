"use client";

import * as React from "react";
import { toast } from "sonner";

type InlineDateFieldProps = {
  value: string;
  ariaLabel: string;
  onSave: (newValue: string) => Promise<void>;
};

/**
 * Champ date modifiable en un seul geste : on clique, on choisit une
 * nouvelle date, elle est enregistrée immédiatement (pas de bouton
 * "Enregistrer" ni de dialogue à ouvrir).
 */
export function InlineDateField({ value, ariaLabel, onSave }: InlineDateFieldProps) {
  const [current, setCurrent] = React.useState(value);
  const [isPending, startTransition] = React.useTransition();

  return (
    <input
      type="date"
      value={current}
      aria-label={ariaLabel}
      disabled={isPending}
      className="rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-input focus:border-input focus:outline-none disabled:opacity-50"
      onChange={(event) => {
        const newValue = event.target.value;
        if (!newValue || newValue === current) return;
        const previous = current;
        setCurrent(newValue);
        startTransition(async () => {
          try {
            await onSave(newValue);
            toast.success("Date mise à jour");
          } catch {
            setCurrent(previous);
            toast.error("Impossible de mettre à jour la date");
          }
        });
      }}
    />
  );
}
