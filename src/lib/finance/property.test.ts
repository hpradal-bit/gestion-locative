import { describe, expect, it } from "vitest";

import {
  calculateCapitalGain,
  calculateCashFlow,
  calculateGrossYield,
  calculateNetYield,
  calculateNetYieldAfterFinancing,
  calculateReturnOnInvestment,
  calculateTotalProjectCost,
} from "./property";

describe("calculateTotalProjectCost", () => {
  it("additionne prix d'achat, frais et travaux", () => {
    const total = calculateTotalProjectCost({
      purchasePrice: 200_000,
      notaryFees: 16_000,
      agencyFees: 8_000,
      worksBudget: 15_000,
      furnitureBudget: 2_000,
    });
    expect(total).toBe(241_000);
  });

  it("fonctionne avec le prix d'achat seul", () => {
    expect(calculateTotalProjectCost({ purchasePrice: 100_000 })).toBe(
      100_000
    );
  });
});

describe("calculateGrossYield", () => {
  it("calcule le pourcentage attendu (14 400 € / 236 000 €)", () => {
    const yieldPct = calculateGrossYield({
      annualRent: 14_400,
      totalProjectCost: 236_000,
    });
    expect(yieldPct).toBeCloseTo(6.1, 1);
  });

  it("ne divise jamais par zéro", () => {
    expect(
      calculateGrossYield({ annualRent: 10_000, totalProjectCost: 0 })
    ).toBe(0);
  });
});

describe("calculateNetYield", () => {
  it("retire les dépenses récurrentes du calcul", () => {
    const yieldPct = calculateNetYield({
      annualRent: 14_400,
      annualRecurringExpenses: 2_400,
      totalProjectCost: 236_000,
    });
    expect(yieldPct).toBeCloseTo(5.08, 1);
  });
});

describe("calculateNetYieldAfterFinancing", () => {
  it("retire en plus les intérêts et l'assurance du crédit", () => {
    const yieldPct = calculateNetYieldAfterFinancing({
      annualRent: 14_400,
      annualRecurringExpenses: 2_400,
      annualLoanInterestAndInsurance: 3_000,
      totalProjectCost: 236_000,
    });
    expect(yieldPct).toBeCloseTo(3.81, 1);
  });
});

describe("calculateCashFlow", () => {
  it("soustrait dépenses et mensualité des revenus encaissés", () => {
    const cashFlow = calculateCashFlow({
      rentCollected: 1_200,
      expenses: 150,
      loanPayment: 900,
    });
    expect(cashFlow).toBe(150);
  });

  it("peut être négatif (effort d'épargne)", () => {
    const cashFlow = calculateCashFlow({
      rentCollected: 800,
      expenses: 150,
      loanPayment: 900,
    });
    expect(cashFlow).toBe(-250);
  });
});

describe("calculateReturnOnInvestment", () => {
  it("calcule le rendement sur l'apport", () => {
    const roi = calculateReturnOnInvestment({
      annualCashFlow: 1_800,
      downPayment: 30_000,
    });
    expect(roi).toBe(6);
  });

  it("ne divise jamais par zéro", () => {
    expect(
      calculateReturnOnInvestment({ annualCashFlow: 1_000, downPayment: 0 })
    ).toBe(0);
  });
});

describe("calculateCapitalGain", () => {
  it("calcule la plus-value quand valorisation et prix d'achat sont connus", () => {
    expect(
      calculateCapitalGain({ purchasePrice: 200_000, currentValue: 250_000 })
    ).toBe(50_000);
  });

  it("peut être négative (moins-value)", () => {
    expect(
      calculateCapitalGain({ purchasePrice: 200_000, currentValue: 180_000 })
    ).toBe(-20_000);
  });

  it("renvoie null si la valorisation n'est pas renseignée", () => {
    expect(calculateCapitalGain({ purchasePrice: 200_000, currentValue: null })).toBeNull();
  });

  it("renvoie null si le prix d'achat n'est pas renseigné", () => {
    expect(calculateCapitalGain({ purchasePrice: null, currentValue: 200_000 })).toBeNull();
  });
});
