import type { documentEntityTypes } from "./schema";

export const ENTITY_TYPE_LABELS: Record<(typeof documentEntityTypes)[number], string> = {
  property: "Bien",
  tenant: "Locataire",
  lease: "Bail",
  expense: "Dépense",
  work: "Travaux",
  loan: "Crédit",
  rent_schedule: "Échéance de loyer",
};
