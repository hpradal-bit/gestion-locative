import { describe, expect, it } from "vitest";

import { addMonthsClamped, generateRentSchedules } from "./scheduling";

describe("addMonthsClamped", () => {
  it("ajoute des mois normalement", () => {
    const result = addMonthsClamped(new Date(2026, 0, 5), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(5);
  });

  it("cale au dernier jour du mois cible si besoin (31 janvier -> février)", () => {
    const result = addMonthsClamped(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28); // 2026 n'est pas bissextile
  });
});

describe("generateRentSchedules", () => {
  it("génère le bon nombre d'échéances avec les bons montants, au jour de paiement convenu", () => {
    const schedules = generateRentSchedules({
      startDate: new Date(2026, 8, 1),
      paymentDueDay: 2,
      rentAmount: 1000,
      chargesAmount: 100,
      count: 12,
    });
    expect(schedules).toHaveLength(12);
    expect(schedules[0]).toEqual({
      due_date: "2026-09-02",
      rent_amount: 1000,
      charges_amount: 100,
    });
    expect(schedules[11].due_date).toBe("2027-08-02");
  });

  it("décale la première échéance au mois suivant si le jour de paiement est déjà passé", () => {
    const schedules = generateRentSchedules({
      startDate: new Date(2026, 8, 15),
      paymentDueDay: 2,
      rentAmount: 1000,
      chargesAmount: 0,
      count: 1,
    });
    expect(schedules[0].due_date).toBe("2026-10-02");
  });

  it("cale le jour de paiement au dernier jour du mois si celui-ci en compte moins (ex : 31 en février)", () => {
    const schedules = generateRentSchedules({
      startDate: new Date(2026, 0, 1),
      paymentDueDay: 31,
      rentAmount: 1000,
      chargesAmount: 0,
      count: 2,
    });
    expect(schedules[0].due_date).toBe("2026-01-31");
    expect(schedules[1].due_date).toBe("2026-02-28");
  });
});
