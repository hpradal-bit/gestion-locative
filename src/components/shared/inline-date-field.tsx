"use client";

import * as React from "react";
import { toast } from "sonner";

function isoToFr(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

/** Convertit "jj/mm/aaaa" en "aaaa-mm-jj", ou `null` si la date est invalide. */
function frToIso(fr: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(fr.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type InlineDateFieldProps = {
  value: string;
  ariaLabel: string;
  onSave: (newValue: string) => Promise<void>;
};

/**
 * Champ date modifiable au clavier, sans passer par un calendrier : on tape
 * jj/mm/aaaa, la date est enregistrée à la validation (Entrée ou perte de
 * focus) — pas de bouton "Enregistrer" ni de dialogue à ouvrir.
 */
export function InlineDateField({ value, ariaLabel, onSave }: InlineDateFieldProps) {
  const [savedIso, setSavedIso] = React.useState(value);
  const [text, setText] = React.useState(() => isoToFr(value));
  const [isPending, startTransition] = React.useTransition();

  // La date vient d'être mise à jour ailleurs (ex : nouveau paiement) : on
  // resynchronise l'affichage sans passer par un effet, en suivant le
  // dernier `value` connu depuis le rendu précédent.
  if (value !== savedIso && !isPending) {
    setSavedIso(value);
    setText(isoToFr(value));
  }

  function commit() {
    const iso = frToIso(text);
    if (!iso) {
      toast.error("Date invalide (format jj/mm/aaaa)");
      setText(isoToFr(savedIso));
      return;
    }
    if (iso === savedIso) {
      setText(isoToFr(savedIso));
      return;
    }
    startTransition(async () => {
      try {
        await onSave(iso);
        setSavedIso(iso);
        toast.success("Date mise à jour");
      } catch {
        setText(isoToFr(savedIso));
        toast.error("Impossible de mettre à jour la date");
      }
    });
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="jj/mm/aaaa"
      value={text}
      aria-label={ariaLabel}
      disabled={isPending}
      className="w-24 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-input focus:border-input focus:outline-none disabled:opacity-50"
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}
