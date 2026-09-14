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

/**
 * Où corriger une variable manquante : quel formulaire de l'application
 * porte réellement la donnée derrière cette variable.
 */
export type VariableLocation = "tenant" | "owner" | "property" | "lease" | "computed";

export const VARIABLE_LOCATION_LABELS: Record<VariableLocation, string> = {
  tenant: "Fiche du locataire",
  owner: "Vos coordonnées (Paramètres)",
  property: "Fiche du bien",
  lease: "Informations du bail",
  computed: "Généré automatiquement",
};

/** Variables disponibles pour un modèle de bail ou d'état des lieux. */
export const LEASE_TEMPLATE_VARIABLES: {
  key: string;
  description: string;
  location: VariableLocation;
}[] = [
  { key: "nom_locataire", description: "Nom de famille du locataire", location: "tenant" },
  { key: "prenom_locataire", description: "Prénom du locataire", location: "tenant" },
  { key: "email_locataire", description: "Email du locataire", location: "tenant" },
  { key: "telephone_locataire", description: "Téléphone du locataire", location: "tenant" },
  { key: "adresse_locataire", description: "Adresse du locataire", location: "tenant" },
  {
    key: "date_naissance_locataire",
    description: "Date de naissance du locataire (si connue)",
    location: "tenant",
  },
  {
    key: "lieu_naissance_locataire",
    description: "Lieu de naissance du locataire (si connu)",
    location: "tenant",
  },
  { key: "nom_proprietaire", description: "Nom du propriétaire", location: "owner" },
  { key: "email_proprietaire", description: "Email du propriétaire", location: "owner" },
  { key: "telephone_proprietaire", description: "Téléphone du propriétaire", location: "owner" },
  { key: "adresse_proprietaire", description: "Adresse du propriétaire", location: "owner" },
  { key: "nom_bien", description: "Nom du bien", location: "property" },
  { key: "adresse_bien", description: "Adresse du bien", location: "property" },
  { key: "ville_bien", description: "Ville du bien", location: "property" },
  { key: "code_postal_bien", description: "Code postal du bien", location: "property" },
  {
    key: "numero_lot",
    description: "Numéro de lot / box (si renseigné sur le bien)",
    location: "property",
  },
  {
    key: "batiment_niveau",
    description: "Bâtiment / niveau (si renseigné sur le bien)",
    location: "property",
  },
  {
    key: "surface_bien",
    description: "Surface approximative du bien (si renseignée)",
    location: "property",
  },
  {
    key: "equipements_bien",
    description: "Équipements du bien (si renseignés)",
    location: "property",
  },
  {
    key: "regle_particuliere",
    description: "Règle particulière de copropriété (si renseignée)",
    location: "property",
  },
  { key: "type_bail", description: "Type de bail", location: "lease" },
  {
    key: "nombre_cles",
    description: "Nombre de clés remises (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "nombre_badges",
    description: "Nombre de badges remis (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "ville_signature",
    description: "Ville de signature (si renseignée sur le bail)",
    location: "lease",
  },
  { key: "loyer", description: "Loyer mensuel hors charges", location: "lease" },
  { key: "charges", description: "Charges mensuelles", location: "lease" },
  { key: "depot_garantie", description: "Dépôt de garantie", location: "lease" },
  { key: "jour_paiement_loyer", description: "Jour du mois où le loyer est dû", location: "lease" },
  { key: "preavis_mois", description: "Durée du préavis de résiliation, en mois", location: "lease" },
  {
    key: "indice_irl",
    description: "Indice IRL/ICC de référence (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "prochaine_revision_loyer",
    description: "Date de la prochaine révision du loyer (si connue)",
    location: "lease",
  },
  { key: "date_debut_bail", description: "Date de début du bail", location: "lease" },
  { key: "date_fin_bail", description: "Date de fin du bail (si connue)", location: "lease" },
  {
    key: "etat_bien_remise",
    description: "État du bien à la remise (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "usage_autorise",
    description: "Usage autorisé (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "mode_paiement_loyer",
    description: "Mode de paiement du loyer (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "detail_charges",
    description: "Détail des charges (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "mode_versement_depot",
    description: "Mode de versement du dépôt de garantie (si renseigné sur le bail)",
    location: "lease",
  },
  {
    key: "reserve_vente",
    description: "Réserve du bailleur en cas de vente (facultatif)",
    location: "lease",
  },
  { key: "date_du_jour", description: "Date du jour de génération", location: "computed" },
];
