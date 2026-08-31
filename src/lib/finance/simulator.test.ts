import { describe, expect, it } from "vitest";

import { calculateInvestmentScore, ratingFromScore, runSimulation } from "./simulator";

const baseInput = {
  purchasePrice: 200_000,
  notaryFees: 16_000,
  agencyFees: 0,
  worksBudget: 15_000,
  furnitureBudget: 0,
  downPayment: 30_000,
  loanAmount: 201_000,
  annualInterestRate: 3.2,
  durationMonths: 240,
  monthlyInsurance: 20,
  monthlyRent: 1_200,
  monthlyCharges: 0,
  vacancyRate: 0,
  propertyTaxAnnual: 900,
  condoFeesAnnual: 600,
  insuranceAnnual: 200,
  managementFeesAnnual: 0,
};

describe("runSimulation", () => {
  it("calcule le coût total du projet", () => {
    const result = runSimulation(baseInput);
    expect(result.totalProjectCost).toBe(231_000);
  });

  it("réduit le loyer effectif en cas de vacance locative", () => {
    const withoutVacancy = runSimulation(baseInput);
    const withVacancy = runSimulation({ ...baseInput, vacancyRate: 10 });
    expect(withVacancy.netYield).toBeLessThan(withoutVacancy.netYield);
  });

  it("l'effort d'épargne est nul quand le cash-flow est positif", () => {
    const result = runSimulation(baseInput);
    if (result.cashFlowMonthly >= 0) {
      expect(result.savingsEffort).toBe(0);
    } else {
      expect(result.savingsEffort).toBeCloseTo(-result.cashFlowMonthly, 5);
    }
  });

  it("un loyer plus élevé améliore le score", () => {
    const low = runSimulation(baseInput);
    const high = runSimulation({ ...baseInput, monthlyRent: 1_800 });
    expect(high.score).toBeGreaterThan(low.score);
  });
});

describe("calculateInvestmentScore", () => {
  it("plafonne à 100", () => {
    expect(
      calculateInvestmentScore({ netYield: 20, cashFlowMonthly: 500 })
    ).toBeLessThanOrEqual(100);
  });

  it("descend vers 0 pour un très mauvais scénario", () => {
    const score = calculateInvestmentScore({ netYield: -5, cashFlowMonthly: -400 });
    expect(score).toBeLessThan(20);
  });
});

describe("ratingFromScore", () => {
  it("mappe les seuils aux appréciations attendues", () => {
    expect(ratingFromScore(90)).toBe("excellent");
    expect(ratingFromScore(65)).toBe("bon");
    expect(ratingFromScore(45)).toBe("a_etudier");
    expect(ratingFromScore(10)).toBe("risque");
  });
});
