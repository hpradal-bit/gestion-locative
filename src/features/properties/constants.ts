import type { TaxRegime } from "@/lib/finance/tax";
import type { propertyTypes } from "./schema";

export const PROPERTY_TYPE_LABELS: Record<(typeof propertyTypes)[number], string> = {
  appartement: "Appartement",
  maison: "Maison",
  studio: "Studio",
  local_commercial: "Local commercial",
  parking: "Parking",
  autre: "Autre",
};

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  micro_foncier: "Location vide — micro-foncier",
  reel_foncier: "Location vide — régime réel",
  lmnp_micro_bic: "Location meublée (LMNP) — micro-BIC",
  lmnp_reel: "Location meublée (LMNP) — régime réel",
};
