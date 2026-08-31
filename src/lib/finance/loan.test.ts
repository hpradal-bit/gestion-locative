import { describe, expect, it } from "vitest";

import {
  calculateAmortizationSchedule,
  calculateMonthlyPayment,
  calculateRemainingPrincipal,
} from "./loan";

describe("calculateMonthlyPayment", () => {
  it("calcule une mensualité standard (200 000 € à 3,2 % sur 20 ans)", () => {
    const payment = calculateMonthlyPayment({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
    });
    expect(payment).toBeCloseTo(1129.33, 1);
  });

  it("gère un taux à 0 % (répartition linéaire du capital)", () => {
    const payment = calculateMonthlyPayment({
      principal: 12_000,
      annualInterestRate: 0,
      durationMonths: 12,
    });
    expect(payment).toBeCloseTo(1000, 5);
  });

  it("renvoie 0 pour une durée nulle ou un capital nul", () => {
    expect(
      calculateMonthlyPayment({
        principal: 100_000,
        annualInterestRate: 2,
        durationMonths: 0,
      })
    ).toBe(0);
    expect(
      calculateMonthlyPayment({
        principal: 0,
        annualInterestRate: 2,
        durationMonths: 120,
      })
    ).toBe(0);
  });
});

describe("calculateRemainingPrincipal", () => {
  it("renvoie le capital initial avant le premier remboursement", () => {
    const remaining = calculateRemainingPrincipal({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
      monthsElapsed: 0,
    });
    expect(remaining).toBe(200_000);
  });

  it("renvoie 0 une fois le crédit intégralement remboursé", () => {
    const remaining = calculateRemainingPrincipal({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
      monthsElapsed: 240,
    });
    expect(remaining).toBe(0);
  });

  it("diminue de façon monotone au fil des mensualités", () => {
    const early = calculateRemainingPrincipal({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
      monthsElapsed: 12,
    });
    const later = calculateRemainingPrincipal({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
      monthsElapsed: 120,
    });
    expect(early).toBeLessThan(200_000);
    expect(later).toBeLessThan(early);
  });

  it("gère un taux à 0 % (amortissement linéaire)", () => {
    const remaining = calculateRemainingPrincipal({
      principal: 12_000,
      annualInterestRate: 0,
      durationMonths: 12,
      monthsElapsed: 6,
    });
    expect(remaining).toBeCloseTo(6_000, 5);
  });
});

describe("calculateAmortizationSchedule", () => {
  it("génère une ligne par mensualité, capital restant décroissant jusqu'à 0", () => {
    const schedule = calculateAmortizationSchedule({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
    });
    expect(schedule).toHaveLength(240);
    expect(schedule[0].remainingPrincipal).toBeLessThan(200_000);
    expect(schedule[239].remainingPrincipal).toBeCloseTo(0, 5);
  });

  it("la somme capital+intérêts de chaque ligne égale la mensualité", () => {
    const schedule = calculateAmortizationSchedule({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
    });
    for (const row of schedule) {
      expect(row.principal + row.interest).toBeCloseTo(row.payment, 6);
    }
  });

  it("la somme du capital remboursé égale le capital emprunté", () => {
    const schedule = calculateAmortizationSchedule({
      principal: 200_000,
      annualInterestRate: 3.2,
      durationMonths: 240,
    });
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(200_000, 4);
  });

  it("renvoie un tableau vide pour un capital ou une durée nulle", () => {
    expect(
      calculateAmortizationSchedule({ principal: 0, annualInterestRate: 3, durationMonths: 12 })
    ).toEqual([]);
  });
});
