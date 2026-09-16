/**
 * Découpe le contenu d'un document généré (bail, état des lieux...) en
 * blocs typés — partagé entre le rendu PDF (GeneratedDocument) et la page
 * web de signature, pour ne jamais avoir deux logiques d'interprétation
 * du même texte.
 */

const ARTICLE_HEADING = /^ARTICLE\s+\d+\s*—/i;
const DIVIDER_LABEL = /^(Entre les soussignés|Il a été convenu ce qui suit)\s*:?$/i;
const SOLO_LABEL = /^ET$/;
const PARTY_LINE = /ci-après dénommé/i;
const SIGNATURE_LINE = /^Signature du /i;
const SMALL_PRINT = /^Document généré/i;

export type DocumentBlock =
  | { type: "heading"; label: string; rest: string }
  | { type: "divider"; label: string }
  | { type: "solo"; label: string }
  | { type: "party"; text: string }
  | { type: "signature"; labels: string[] }
  | { type: "smallprint"; text: string }
  | { type: "paragraph"; text: string };

/** Le premier paragraphe (le titre en majuscules) n'est pas inclus : il est affiché à part. */
export function parseDocumentBlocks(content: string): DocumentBlock[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const body = paragraphs[0]?.toUpperCase() === paragraphs[0] ? paragraphs.slice(1) : paragraphs;

  return body.map((paragraph): DocumentBlock => {
    if (ARTICLE_HEADING.test(paragraph)) {
      const separatorIndex = paragraph.indexOf("—");
      return separatorIndex === -1
        ? { type: "heading", label: paragraph, rest: "" }
        : {
            type: "heading",
            label: paragraph.slice(0, separatorIndex).trim(),
            rest: paragraph.slice(separatorIndex + 1).trim(),
          };
    }
    if (DIVIDER_LABEL.test(paragraph)) {
      return { type: "divider", label: paragraph.replace(/:$/, "") };
    }
    if (SOLO_LABEL.test(paragraph)) {
      return { type: "solo", label: paragraph };
    }
    if (PARTY_LINE.test(paragraph)) {
      return { type: "party", text: paragraph };
    }
    if (SIGNATURE_LINE.test(paragraph)) {
      return { type: "signature", labels: paragraph.split(/\s{2,}/).filter(Boolean) };
    }
    if (SMALL_PRINT.test(paragraph)) {
      return { type: "smallprint", text: paragraph };
    }
    return { type: "paragraph", text: paragraph };
  });
}

/**
 * Regroupe les blocs par article : chaque groupe démarre à un titre
 * ("heading") et contient les blocs qui le suivent jusqu'au prochain titre.
 * Sert à la fois au contrôle de l'orphelin en PDF (le groupe entier bascule
 * de page ensemble) et à l'encadré visuel de chaque article sur le web.
 */
export function groupByHeading(blocks: DocumentBlock[]): DocumentBlock[][] {
  const groups: DocumentBlock[][] = [];
  for (const block of blocks) {
    if (block.type === "heading" || groups.length === 0) {
      groups.push([block]);
    } else {
      groups[groups.length - 1].push(block);
    }
  }
  return groups;
}

/** "ARTICLE 1" → "Article 1" : les libellés du modèle sont saisis en majuscules. */
export function toSentenceCase(text: string): string {
  if (!text) return text;
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
