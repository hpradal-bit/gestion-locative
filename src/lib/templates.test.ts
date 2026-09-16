import { describe, expect, it } from "vitest";

import { extractTemplateVariables, renderTemplate, renderTemplateWithEmphasis } from "./templates";
import { splitEmphasis } from "./emphasis";

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

describe("renderTemplateWithEmphasis", () => {
  it("entoure les valeurs injectées de marqueurs récupérables par splitEmphasis", () => {
    const result = renderTemplateWithEmphasis("Bonjour {{nom_locataire}}, loyer : {{loyer}} €.", {
      nom_locataire: "Jean Dupont",
      loyer: "850",
    });
    expect(splitEmphasis(result)).toEqual([
      { text: "Bonjour ", bold: false },
      { text: "Jean Dupont", bold: true },
      { text: ", loyer : ", bold: false },
      { text: "850", bold: true },
      { text: " €.", bold: false },
    ]);
  });

  it("laisse intactes les variables inconnues, sans les marquer", () => {
    const result = renderTemplateWithEmphasis("Adresse : {{adresse_bien}}", {});
    expect(splitEmphasis(result)).toEqual([{ text: "Adresse : {{adresse_bien}}", bold: false }]);
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
