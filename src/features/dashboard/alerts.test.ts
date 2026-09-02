import { describe, expect, it } from "vitest";

import { deriveAlerts } from "./alerts";

describe("deriveAlerts", () => {
  it("invite à ajouter un premier bien quand le patrimoine est vide", () => {
    const alerts = deriveAlerts({
      propertiesCount: 0,
      lateRentCount: 0,
      loansEndingSoonCount: 0,
      leasesEndingSoonCount: 0,
    });
    expect(alerts).toEqual([
      {
        id: "no-property",
        level: "info",
        message:
          "Ajoutez votre premier bien pour commencer à suivre votre patrimoine.",
      },
    ]);
  });

  it("signale les loyers en retard", () => {
    const alerts = deriveAlerts({
      propertiesCount: 2,
      lateRentCount: 2,
      loansEndingSoonCount: 0,
      leasesEndingSoonCount: 0,
    });
    expect(alerts).toContainEqual({
      id: "late-rent",
      level: "danger",
      message: "2 loyers en retard",
    });
  });

  it("signale les baux qui arrivent à échéance", () => {
    const alerts = deriveAlerts({
      propertiesCount: 2,
      lateRentCount: 0,
      loansEndingSoonCount: 0,
      leasesEndingSoonCount: 1,
    });
    expect(alerts).toContainEqual({
      id: "lease-ending-soon",
      level: "info",
      message: "1 bail arrive à échéance",
    });
  });

  it("affiche un message positif quand tout est à jour", () => {
    const alerts = deriveAlerts({
      propertiesCount: 2,
      lateRentCount: 0,
      loansEndingSoonCount: 0,
      leasesEndingSoonCount: 0,
    });
    expect(alerts).toContainEqual({
      id: "all-good",
      level: "success",
      message: "Tous les loyers sont à jour",
    });
  });
});
