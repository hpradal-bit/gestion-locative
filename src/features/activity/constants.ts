import type { ActivityAction } from "./log";

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  reminder_sent: "Relance envoyée",
  receipt_generated: "Quittance générée",
  payment_recorded: "Loyer marqué comme payé",
  lease_created: "Bail créé",
  lease_updated: "Bail modifié",
  lease_ended: "Bail terminé",
  document_added: "Document ajouté",
  document_deleted: "Document supprimé",
  property_created: "Bien créé",
  property_updated: "Bien modifié",
  simulation_created: "Simulation créée",
  simulation_updated: "Simulation modifiée",
};

export const ACTIVITY_ACTION_EMOJI: Record<ActivityAction, string> = {
  reminder_sent: "📧",
  receipt_generated: "📄",
  payment_recorded: "💰",
  lease_created: "📝",
  lease_updated: "✏️",
  lease_ended: "🔚",
  document_added: "📁",
  document_deleted: "🗑️",
  property_created: "🏠",
  property_updated: "🏠",
  simulation_created: "📈",
  simulation_updated: "📈",
};
