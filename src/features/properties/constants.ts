import type { propertyTypes } from "./schema";

export const PROPERTY_TYPE_LABELS: Record<(typeof propertyTypes)[number], string> = {
  appartement: "Appartement",
  maison: "Maison",
  studio: "Studio",
  local_commercial: "Local commercial",
  parking: "Parking",
  autre: "Autre",
};
