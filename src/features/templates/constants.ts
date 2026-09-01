export const templateCategories = [
  "bail",
  "etat_des_lieux",
  "quittance",
  "relance",
  "autre",
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  bail: "Bail de location",
  etat_des_lieux: "État des lieux",
  quittance: "Quittance",
  relance: "Lettre de relance",
  autre: "Autres documents",
};

/** Variables disponibles pour un modèle de bail ou d'état des lieux. */
export const LEASE_TEMPLATE_VARIABLES: { key: string; description: string }[] = [
  { key: "nom_locataire", description: "Nom de famille du locataire" },
  { key: "prenom_locataire", description: "Prénom du locataire" },
  { key: "nom_proprietaire", description: "Nom du propriétaire" },
  { key: "nom_bien", description: "Nom du bien" },
  { key: "adresse_bien", description: "Adresse du bien" },
  { key: "ville_bien", description: "Ville du bien" },
  { key: "loyer", description: "Loyer mensuel hors charges" },
  { key: "charges", description: "Charges mensuelles" },
  { key: "depot_garantie", description: "Dépôt de garantie" },
  { key: "date_debut_bail", description: "Date de début du bail" },
  { key: "date_fin_bail", description: "Date de fin du bail (si connue)" },
  { key: "date_du_jour", description: "Date du jour de génération" },
];
