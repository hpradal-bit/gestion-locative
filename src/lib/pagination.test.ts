import { describe, expect, it } from "vitest";

import { paginate, parsePageParam } from "./pagination";

describe("paginate", () => {
  const items = Array.from({ length: 45 }, (_, i) => i + 1);

  it("découpe en pages de la taille demandée", () => {
    const result = paginate(items, 1, 20);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]).toBe(1);
    expect(result.pageCount).toBe(3);
  });

  it("renvoie la dernière page partielle", () => {
    const result = paginate(items, 3, 20);
    expect(result.items).toHaveLength(5);
  });

  it("cale une page hors bornes sur la dernière page valide", () => {
    const result = paginate(items, 99, 20);
    expect(result.currentPage).toBe(3);
  });

  it("cale une page négative ou nulle sur la première page", () => {
    expect(paginate(items, 0, 20).currentPage).toBe(1);
    expect(paginate(items, -5, 20).currentPage).toBe(1);
  });

  it("gère une liste vide", () => {
    const result = paginate([], 1, 20);
    expect(result.items).toEqual([]);
    expect(result.pageCount).toBe(1);
  });
});

describe("parsePageParam", () => {
  it("parse une chaîne numérique valide", () => {
    expect(parsePageParam("3")).toBe(3);
  });

  it("revient à 1 pour une valeur invalide ou absente", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("-2")).toBe(1);
    expect(parsePageParam("0")).toBe(1);
  });

  it("prend la première valeur si un tableau est fourni", () => {
    expect(parsePageParam(["2", "5"])).toBe(2);
  });
});
