import { describe, expect, it } from "vitest";

import {
  calculateLmnpMicroBicTax,
  calculateLmnpRealTax,
  calculateMicroFoncierTax,
  calculateRealFoncierTax,
  estimateTax,
} from "./tax";

describe("calculateMicroFoncierTax", () => {
  it("applique l'abattement de 30 % puis le TMI et les prélèvements sociaux", () => {
    const result = calculateMicroFoncierTax({ grossAnnualRent: 10_000, tmiRate: 0.3 });
    expect(result.taxableIncome).toBe(7_000);
    expect(result.incomeTax).toBeCloseTo(2_100);
    expect(result.socialCharges).toBeCloseTo(1_204);
    expect(result.totalTax).toBeCloseTo(3_304);
  });

  it("peut désactiver les prélèvements sociaux", () => {
    const result = calculateMicroFoncierTax({
      grossAnnualRent: 10_000,
      tmiRate: 0.3,
      applySocialCharges: false,
    });
    expect(result.socialCharges).toBe(0);
    expect(result.totalTax).toBeCloseTo(2_100);
  });
});

describe("calculateRealFoncierTax", () => {
  it("impose le résultat net quand il est positif", () => {
    const result = calculateRealFoncierTax({
      grossAnnualRent: 10_000,
      deductibleExpenses: 4_000,
      tmiRate: 0.3,
    });
    expect(result.taxableIncome).toBe(6_000);
    expect(result.incomeTax).toBeCloseTo(1_800);
    expect(result.incomeTaxSavingFromDeficit).toBe(0);
  });

  it("impute le déficit foncier sur le revenu global dans la limite légale", () => {
    const result = calculateRealFoncierTax({
      grossAnnualRent: 5_000,
      deductibleExpenses: 20_000,
      tmiRate: 0.3,
    });
    // Déficit de 15 000 €, plafonné à 10 700 € imputables.
    expect(result.incomeTaxSavingFromDeficit).toBeCloseTo(10_700 * 0.3);
    expect(result.totalTax).toBeCloseTo(-(10_700 * 0.3));
  });

  it("ne réduit jamais les prélèvements sociaux via le déficit foncier", () => {
    const result = calculateRealFoncierTax({
      grossAnnualRent: 5_000,
      deductibleExpenses: 20_000,
      tmiRate: 0.3,
    });
    expect(result.socialCharges).toBe(0);
  });
});

describe("calculateLmnpMicroBicTax", () => {
  it("applique l'abattement de 50 %", () => {
    const result = calculateLmnpMicroBicTax({ grossAnnualRent: 10_000, tmiRate: 0.3 });
    expect(result.taxableIncome).toBe(5_000);
    expect(result.incomeTax).toBeCloseTo(1_500);
  });
});

describe("calculateLmnpRealTax", () => {
  it("déduit charges réelles et amortissement", () => {
    const result = calculateLmnpRealTax({
      grossAnnualRent: 12_000,
      deductibleExpenses: 3_000,
      amortization: 5_000,
      tmiRate: 0.3,
    });
    expect(result.taxableIncome).toBe(4_000);
    expect(result.carriedForwardAmortization).toBe(0);
  });

  it("plafonne l'amortissement utilisé au résultat avant amortissement (jamais de déficit créé)", () => {
    const result = calculateLmnpRealTax({
      grossAnnualRent: 10_000,
      deductibleExpenses: 3_000,
      amortization: 20_000,
      tmiRate: 0.3,
    });
    // Résultat avant amortissement = 7 000 ; amortissement utilisé plafonné à 7 000.
    expect(result.taxableIncome).toBe(0);
    expect(result.carriedForwardAmortization).toBe(13_000);
    expect(result.incomeTax).toBe(0);
  });

  it("ne crée jamais de déficit même si les charges réelles dépassent les loyers", () => {
    const result = calculateLmnpRealTax({
      grossAnnualRent: 5_000,
      deductibleExpenses: 8_000,
      amortization: 10_000,
      tmiRate: 0.3,
    });
    expect(result.taxableIncome).toBe(0);
    expect(result.carriedForwardAmortization).toBe(10_000);
  });
});

describe("steps (détail étape par étape)", () => {
  it("chaque fonction renvoie au moins une étape non vide", () => {
    const regimes = [
      calculateMicroFoncierTax({ grossAnnualRent: 10_000, tmiRate: 0.3 }),
      calculateRealFoncierTax({ grossAnnualRent: 10_000, deductibleExpenses: 4_000, tmiRate: 0.3 }),
      calculateRealFoncierTax({ grossAnnualRent: 5_000, deductibleExpenses: 20_000, tmiRate: 0.3 }),
      calculateLmnpMicroBicTax({ grossAnnualRent: 10_000, tmiRate: 0.3 }),
      calculateLmnpRealTax({
        grossAnnualRent: 10_000,
        deductibleExpenses: 3_000,
        amortization: 20_000,
        tmiRate: 0.3,
      }),
    ];
    for (const result of regimes) {
      expect(result.steps.length).toBeGreaterThan(0);
    }
  });

  it("la première étape du réel foncier est toujours le loyer brut", () => {
    const result = calculateRealFoncierTax({
      grossAnnualRent: 10_000,
      deductibleExpenses: 4_000,
      tmiRate: 0.3,
    });
    expect(result.steps[0]).toEqual({
      label: "Revenus locatifs bruts encaissés",
      amount: 10_000,
    });
  });
});

describe("estimateTax", () => {
  it("distribue vers la bonne fonction selon le régime", () => {
    const micro = estimateTax({
      regime: "micro_foncier",
      grossAnnualRent: 10_000,
      deductibleExpenses: 0,
      tmiRate: 0.3,
    });
    const reel = estimateTax({
      regime: "reel_foncier",
      grossAnnualRent: 10_000,
      deductibleExpenses: 4_000,
      tmiRate: 0.3,
    });
    expect(micro.taxableIncome).toBe(7_000);
    expect(reel.taxableIncome).toBe(6_000);
  });
});
