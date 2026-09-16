/**
 * Marqueurs invisibles posés autour des valeurs injectées depuis
 * l'application (renderTemplateWithEmphasis) pour que les rendus PDF et
 * web du document puissent les mettre en gras — le propriétaire et le
 * locataire repèrent ainsi immédiatement ce qui vient de l'application vs
 * le texte juridique fixe du modèle.
 */
export const EMPHASIS_START = "";
export const EMPHASIS_END = "";

export type TextRun = { text: string; bold: boolean };

/** Découpe un texte marqué en segments {text, bold} prêts à afficher. */
export function splitEmphasis(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = new RegExp(`${EMPHASIS_START}([^${EMPHASIS_END}]*)${EMPHASIS_END}`, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    runs.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex), bold: false });
  }
  return runs;
}
