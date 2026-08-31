export type RentScheduleStatus = "paid" | "partial" | "late" | "pending";

export type ComputeRentScheduleStatusInput = {
  dueDate: Date;
  totalDue: number;
  totalPaid: number;
  today?: Date;
};

/**
 * Le statut d'une échéance n'est jamais stocké : il est toujours recalculé à
 * partir des paiements enregistrés et de la date du jour, pour ne jamais
 * désynchroniser l'affichage de la réalité des paiements.
 */
export function computeRentScheduleStatus({
  dueDate,
  totalDue,
  totalPaid,
  today = new Date(),
}: ComputeRentScheduleStatusInput): RentScheduleStatus {
  if (totalDue > 0 && totalPaid >= totalDue) return "paid";
  if (totalPaid > 0) return "partial";
  if (dueDate.getTime() < today.getTime()) return "late";
  return "pending";
}
