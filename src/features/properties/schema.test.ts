import { describe, expect, it } from "vitest";

import { parsePropertyFormData } from "./schema";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe("parsePropertyFormData", () => {
  it("accepte un formulaire minimal (nom seul, tout le reste vide)", () => {
    const formData = buildFormData({ name: "Appartement Test" });
    const result = parsePropertyFormData(formData);
    expect(result.success).toBe(true);
  });

  it("traite un property_type vide (Select non renseigné) comme absent, pas comme invalide", () => {
    const formData = buildFormData({ name: "Appartement Test", property_type: "" });
    const result = parsePropertyFormData(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.property_type).toBeUndefined();
    }
  });

  it("accepte un property_type valide", () => {
    const formData = buildFormData({ name: "Appartement Test", property_type: "appartement" });
    const result = parsePropertyFormData(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.property_type).toBe("appartement");
    }
  });

  it("rejette un nom vide avec un message clair", () => {
    const formData = buildFormData({ name: "" });
    const result = parsePropertyFormData(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom du bien est requis.");
    }
  });
});
