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

export type GeneratedRentSchedule = {
  due_date: string;
  rent_amount: number;
  charges_amount: number;
};

/**
 * Génère les échéances de loyer d'un bail : une échéance par mois, au même
 * jour que la date de début du bail, montant dérivé du bail (jamais ressaisi).
 */
export function generateRentSchedules({
  startDate,
  rentAmount,
  chargesAmount,
  count,
}: {
  startDate: Date;
  rentAmount: number;
  chargesAmount: number;
  count: number;
}): GeneratedRentSchedule[] {
  return Array.from({ length: count }, (_, i) => {
    const dueDate = addMonthsClamped(startDate, i);
    return {
      due_date: dueDate.toISOString().slice(0, 10),
      rent_amount: rentAmount,
      charges_amount: chargesAmount,
    };
  });
}
