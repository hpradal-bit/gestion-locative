/** Clé de mois stable, triable lexicographiquement : "2026-09". */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Les `count` derniers mois (mois courant inclus), du plus ancien au plus récent. */
export function lastNMonthKeys(count: number, reference = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

const MONTH_LABELS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

/** "2026-09" -> "sept. 26" */
export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const label = MONTH_LABELS_FR[month - 1] ?? key;
  return `${label} ${String(year).slice(2)}`;
}

/** Nombre de mois calendaires entiers entre deux dates (peut être négatif). */
export function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}
