import type { expenseCategories } from "./schema";

export const EXPENSE_CATEGORY_LABELS: Record<(typeof expenseCategories)[number], string> = {
  copropriete: "Copropriété",
  taxe_fonciere: "Taxe foncière",
  assurance: "Assurance",
  travaux: "Travaux",
  entretien: "Entretien",
  reparation: "Réparation",
  gestion: "Gestion",
  banque: "Banque",
  energie: "Énergie",
  autres: "Autres",
};
