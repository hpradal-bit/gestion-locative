import type { workStatuses } from "./schema";

export const WORK_STATUS_LABELS: Record<(typeof workStatuses)[number], string> = {
  a_prevoir: "À prévoir",
  prevu: "Prévu",
  en_cours: "En cours",
  termine: "Terminé",
  paye: "Payé",
};

export const WORK_STATUS_BADGE_VARIANT: Record<
  (typeof workStatuses)[number],
  "secondary" | "warning" | "success" | "default"
> = {
  a_prevoir: "secondary",
  prevu: "secondary",
  en_cours: "warning",
  termine: "success",
  paye: "success",
};
