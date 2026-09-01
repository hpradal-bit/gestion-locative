/** Ajoute `months` mois à `date`, en calant le jour au dernier jour du mois si besoin (ex : 31 janvier + 1 mois -> 28/29 février). */
export function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();
  target.setDate(Math.min(day, lastDayOfTargetMonth));
  return target;
}

/**
 * Renvoie la date, dans le mois de `date` décalé de `monthOffset`, au jour
 * `day` — calé au dernier jour du mois si celui-ci en compte moins (ex :
 * jour 31 en février -> 28/29).
 */
function dateAtDay(date: Date, monthOffset: number, day: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const lastDayOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDayOfMonth));
  return target;
}

export type GeneratedRentSchedule = {
  due_date: string;
  rent_amount: number;
  charges_amount: number;
};

/**
 * Génère les échéances de loyer d'un bail : une échéance par mois, au jour
 * de paiement convenu avec le locataire (`paymentDueDay`, ex : le 2 de
 * chaque mois) — jamais recalé sur la date de début du bail, qui peut
 * tomber n'importe quel jour. La première échéance tombe le même mois que
 * le début du bail si ce jour n'est pas encore passé, sinon le mois
 * suivant. Montants dérivés du bail, jamais ressaisis.
 */
export function generateRentSchedules({
  startDate,
  paymentDueDay,
  rentAmount,
  chargesAmount,
  count,
}: {
  startDate: Date;
  paymentDueDay: number;
  rentAmount: number;
  chargesAmount: number;
  count: number;
}): GeneratedRentSchedule[] {
  const firstMonthOffset = startDate.getDate() <= paymentDueDay ? 0 : 1;

  return Array.from({ length: count }, (_, i) => {
    const dueDate = dateAtDay(startDate, firstMonthOffset + i, paymentDueDay);
    return {
      due_date: dueDate.toISOString().slice(0, 10),
      rent_amount: rentAmount,
      charges_amount: chargesAmount,
    };
  });
}
