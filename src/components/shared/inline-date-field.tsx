"use client";

import * as React from "react";
import { toast } from "sonner";

type DateParts = { day: string; month: string; year: string };

function isoToParts(iso: string): DateParts {
  const [year, month, day] = iso.split("-");
  return { day, month, year };
}

/** Construit "aaaa-mm-jj" à partir des 3 segments, ou `null` si la date est incomplète/invalide. */
function partsToIso({ day, month, year }: DateParts): string | null {
  if (day.length === 0 || month.length === 0 || year.length !== 4) return null;

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }

  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

type InlineDateFieldProps = {
  value: string;
  ariaLabel: string;
  onSave: (newValue: string) => Promise<void>;
};

const SEGMENT_CLASS =
  "w-7 rounded-md border border-transparent bg-transparent py-1 text-center text-sm tabular-nums hover:border-input focus:border-input focus:outline-none disabled:opacity-50";

/**
 * Champ date modifiable au clavier, sans calendrier : trois segments
 * (jour, mois, année) séparés par des "/". Taper 2 chiffres dans le jour
 * fait automatiquement passer au mois, puis à l'année — et modifier le
 * jour ne touche jamais le mois ou l'année, chaque segment étant un champ
 * indépendant. La date est enregistrée quand le focus quitte le groupe
 * (clic ailleurs ou touche Entrée).
 */
export function InlineDateField({ value, ariaLabel, onSave }: InlineDateFieldProps) {
  const initial = isoToParts(value);
  const [day, setDay] = React.useState(initial.day);
  const [month, setMonth] = React.useState(initial.month);
  const [year, setYear] = React.useState(initial.year);
  const [savedIso, setSavedIso] = React.useState(value);
  const [isPending, startTransition] = React.useTransition();

  const dayRef = React.useRef<HTMLInputElement>(null);
  const monthRef = React.useRef<HTMLInputElement>(null);
  const yearRef = React.useRef<HTMLInputElement>(null);

  // La date vient d'être mise à jour ailleurs (ex : nouveau paiement) : on
  // resynchronise l'affichage sans passer par un effet, en suivant le
  // dernier `value` connu depuis le rendu précédent.
  if (value !== savedIso && !isPending) {
    const parts = isoToParts(value);
    setSavedIso(value);
    setDay(parts.day);
    setMonth(parts.month);
    setYear(parts.year);
  }

  function resetToSaved() {
    const parts = isoToParts(savedIso);
    setDay(parts.day);
    setMonth(parts.month);
    setYear(parts.year);
  }

  function commit(parts: DateParts) {
    const iso = partsToIso(parts);
    if (!iso) {
      toast.error("Date invalide (jj/mm/aaaa)");
      resetToSaved();
      return;
    }
    if (iso === savedIso) {
      resetToSaved();
      return;
    }
    startTransition(async () => {
      try {
        await onSave(iso);
        setSavedIso(iso);
        toast.success("Date mise à jour");
      } catch {
        resetToSaved();
        toast.error("Impossible de mettre à jour la date");
      }
    });
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const next = event.relatedTarget;
    const stillInGroup = [dayRef.current, monthRef.current, yearRef.current].some(
      (el) => el && el === next
    );
    if (stillInGroup) return;
    commit({ day, month, year });
  }

  function handleDayChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(digits);
    if (digits.length === 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(digits);
    if (digits.length === 2) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  }

  function handleYearChange(event: React.ChangeEvent<HTMLInputElement>) {
    setYear(event.target.value.replace(/\D/g, "").slice(0, 4));
  }

  function handleMonthKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Backspace" && event.currentTarget.value === "") {
      dayRef.current?.focus();
      dayRef.current?.select();
    }
  }

  function handleYearKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Backspace" && event.currentTarget.value === "") {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }

  function handleEnterKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="jj"
        value={day}
        aria-label={`${ariaLabel} — jour`}
        disabled={isPending}
        className={SEGMENT_CLASS}
        onBlur={handleBlur}
        onChange={handleDayChange}
        onKeyDown={handleEnterKeyDown}
      />
      <span className="text-muted-foreground">/</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="mm"
        value={month}
        aria-label={`${ariaLabel} — mois`}
        disabled={isPending}
        className={SEGMENT_CLASS}
        onBlur={handleBlur}
        onChange={handleMonthChange}
        onKeyDown={handleMonthKeyDown}
      />
      <span className="text-muted-foreground">/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="aaaa"
        value={year}
        aria-label={`${ariaLabel} — année`}
        disabled={isPending}
        className={`${SEGMENT_CLASS} w-12`}
        onBlur={handleBlur}
        onChange={handleYearChange}
        onKeyDown={handleYearKeyDown}
      />
    </span>
  );
}
