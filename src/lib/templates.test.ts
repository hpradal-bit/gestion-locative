import { describe, expect, it } from "vitest";

import { extractTemplateVariables, renderTemplate } from "./templates";

describe("renderTemplate", () => {
  it("remplace les variables connues", () => {
    const result = renderTemplate("Bonjour {{nom_locataire}}, loyer : {{loyer}} €.", {
      nom_locataire: "Jean Dupont",
      loyer: "850",
    });
    expect(result).toBe("Bonjour Jean Dupont, loyer : 850 €.");
  });

  it("laisse intactes les variables inconnues plutôt que de les vider", () => {
    const result = renderTemplate("Adresse : {{adresse_bien}}", {});
    expect(result).toBe("Adresse : {{adresse_bien}}");
  });

  it("tolère les espaces à l'intérieur des accolades", () => {
    const result = renderTemplate("{{ nom_locataire }}", { nom_locataire: "Jean" });
    expect(result).toBe("Jean");
  });

  it("remplace plusieurs occurrences de la même variable", () => {
    const result = renderTemplate("{{loyer}} et encore {{loyer}}", { loyer: "850" });
    expect(result).toBe("850 et encore 850");
  });
});

describe("extractTemplateVariables", () => {
  it("liste les variables uniques présentes dans un modèle", () => {
    const vars = extractTemplateVariables(
      "{{nom_locataire}} — {{loyer}} — {{nom_locataire}} encore"
    );
    expect(vars).toEqual(["nom_locataire", "loyer"]);
  });

  it("renvoie un tableau vide si aucune variable", () => {
    expect(extractTemplateVariables("Texte sans variable.")).toEqual([]);
  });
});
