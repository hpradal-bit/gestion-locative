/**
 * Substitue les variables {{cle}} d'un modèle par leur valeur connue.
 * Une variable non fournie est laissée telle quelle dans le texte — plutôt
 * que remplacée par une chaîne vide, ce qui la rendrait invisible et
 * pousserait à ne pas remarquer l'oubli.
 */
export function renderTemplate(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    return key in variables ? variables[key] : match;
  });
}

/** Liste les clés de variables ({{cle}}) présentes dans un modèle. */
export function extractTemplateVariables(content: string): string[] {
  const matches = content.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}
