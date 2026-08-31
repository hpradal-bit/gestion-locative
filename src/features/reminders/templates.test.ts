import { describe, expect, it } from "vitest";

import { buildReminderMessage } from "./templates";

const context = {
  tenantName: "Jean Dupont",
  propertyName: "Appartement Paris 11e",
  amount: 1100,
  dueDate: "2026-09-05",
};

describe("buildReminderMessage", () => {
  it("le niveau 1 est cordial et mentionne le montant", () => {
    const { subject, body } = buildReminderMessage(1, context);
    expect(subject).toContain("Appartement Paris 11e");
    expect(body).toMatch(/1\s*100\s*€/);
    expect(body).toContain("Jean Dupont");
    expect(body.toLowerCase()).not.toContain("mise en demeure");
  });

  it("le niveau 2 est plus ferme que le niveau 1", () => {
    const { body } = buildReminderMessage(2, context);
    expect(body).toContain("malgré un premier rappel");
  });

  it("le niveau 3 est une mise en demeure formelle", () => {
    const { subject, body } = buildReminderMessage(3, context);
    expect(subject.toLowerCase()).toContain("mise en demeure");
    expect(body).toContain("8 jours");
  });

  it("les trois niveaux ont des contenus différents", () => {
    const messages = [1, 2, 3].map((level) =>
      buildReminderMessage(level as 1 | 2 | 3, context).body
    );
    expect(new Set(messages).size).toBe(3);
  });
});
