import type { DashboardAlert } from "./types";

export type DeriveAlertsInput = {
  propertiesCount: number;
  lateRentCount: number;
  loansEndingSoonCount: number;
};

/**
 * Les alertes sont dérivées des données réelles (jamais d'état stocké à part) :
 * rejouer ce calcul doit toujours redonner le même résultat pour les mêmes données.
 */
export function deriveAlerts({
  propertiesCount,
  lateRentCount,
  loansEndingSoonCount,
}: DeriveAlertsInput): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (propertiesCount === 0) {
    alerts.push({
      id: "no-property",
      level: "info",
      message: "Ajoutez votre premier bien pour commencer à suivre votre patrimoine.",
    });
    return alerts;
  }

  if (lateRentCount > 0) {
    alerts.push({
      id: "late-rent",
      level: "danger",
      message:
        lateRentCount === 1
          ? "1 loyer en retard"
          : `${lateRentCount} loyers en retard`,
    });
  }

  if (loansEndingSoonCount > 0) {
    alerts.push({
      id: "loan-ending-soon",
      level: "info",
      message:
        loansEndingSoonCount === 1
          ? "1 crédit se termine bientôt"
          : `${loansEndingSoonCount} crédits se terminent bientôt`,
    });
  }

  if (lateRentCount === 0) {
    alerts.push({
      id: "all-good",
      level: "success",
      message: "Tous les loyers sont à jour",
    });
  }

  return alerts;
}
