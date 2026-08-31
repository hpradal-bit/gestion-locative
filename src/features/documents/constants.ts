import type { documentTypes } from "./schema";

export const DOCUMENT_TYPE_LABELS: Record<(typeof documentTypes)[number], string> = {
  facture: "Facture",
  quittance: "Quittance",
  bail: "Bail",
  devis: "Devis",
  assurance: "Assurance",
  taxe_fonciere: "Taxe foncière",
  autres: "Autres",
};
