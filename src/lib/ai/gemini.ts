/**
 * Lecture intelligente de documents (bail, quittance...) via l'API Gemini.
 * Appel HTTP direct (pas de SDK @google/genai) — même logique que
 * lib/notifications/resend-provider.ts : une dépendance de moins à
 * maintenir pour un simple appel REST.
 *
 * Sécurité : GEMINI_API_KEY ne doit exister que côté serveur (jamais une
 * variable NEXT_PUBLIC_) — ce module n'est appelé que depuis des Server
 * Actions/Route Handlers.
 */

// Modèle recommandé pour le tier gratuit au moment de l'écriture — à
// ajuster ici si Google renomme/déprécie le modèle, sans toucher au reste
// du code.
const GEMINI_MODEL = "gemini-3-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type ExtractedField = {
  key: string;
  value: string;
  /** 0-100 : confiance du modèle dans la valeur extraite. */
  confidence: number;
};

export type ExtractionResult =
  | { success: true; fields: ExtractedField[] }
  | { success: false; error: string };

export type ExtractionFieldSpec = { key: string; label: string; description: string };

const GENERIC_ERROR = "Impossible d'analyser ce document. Réessayez ou saisissez les informations manuellement.";

/**
 * Envoie un document (PDF ou image) à Gemini et lui demande d'en extraire
 * les champs demandés, avec un niveau de confiance par champ. Ne modifie
 * jamais la base de données elle-même — c'est à l'appelant de proposer les
 * valeurs extraites à l'utilisateur pour validation.
 */
export async function extractFieldsFromDocument(input: {
  fileBase64: string;
  mimeType: string;
  fields: ExtractionFieldSpec[];
  documentDescription: string;
}): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "L'analyse IA n'est pas encore configurée (clé Gemini manquante).",
    };
  }

  const fieldList = input.fields.map((f) => `- ${f.key} : ${f.description}`).join("\n");
  const prompt = `Tu analyses ${input.documentDescription}. Extrait uniquement les informations suivantes, si elles sont présentes dans le document :\n${fieldList}\n\nPour chaque champ trouvé, donne la valeur telle qu'elle apparaît dans le document (dates au format JJ/MM/AAAA, montants en chiffres sans le symbole €) et un score de confiance de 0 à 100. N'invente jamais une valeur absente : omets le champ plutôt que de deviner.`;

  const body = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType: input.mimeType, data: input.fileBase64 } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          fields: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                key: { type: "STRING", enum: input.fields.map((f) => f.key) },
                value: { type: "STRING" },
                confidence: { type: "NUMBER" },
              },
              required: ["key", "value", "confidence"],
            },
          },
        },
        required: ["fields"],
      },
    },
  };

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, error: GENERIC_ERROR };
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { success: false, error: GENERIC_ERROR };
    }

    const parsed = JSON.parse(text) as { fields?: ExtractedField[] };
    if (!Array.isArray(parsed.fields)) {
      return { success: false, error: GENERIC_ERROR };
    }

    return { success: true, fields: parsed.fields };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}
