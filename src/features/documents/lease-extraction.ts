import type { ExtractionFieldSpec } from "@/lib/ai/gemini";

export const LEASE_EXTRACTION_FIELDS: ExtractionFieldSpec[] = [
  { key: "nom_locataire", label: "Locataire", description: "Nom et prénom du locataire" },
  { key: "adresse_bien", label: "Adresse", description: "Adresse du logement loué" },
  { key: "loyer", label: "Loyer", description: "Loyer mensuel hors charges, en euros" },
  { key: "charges", label: "Charges", description: "Montant des charges mensuelles, en euros" },
  {
    key: "depot_garantie",
    label: "Dépôt de garantie",
    description: "Montant du dépôt de garantie, en euros",
  },
  { key: "date_debut", label: "Date de début", description: "Date de début du bail" },
  { key: "date_fin", label: "Date de fin", description: "Date de fin du bail, si présente" },
];

/** Champs qui peuvent être appliqués directement au bail après validation humaine. */
export const APPLICABLE_LEASE_FIELDS = [
  "loyer",
  "charges",
  "depot_garantie",
  "date_debut",
  "date_fin",
] as const;
