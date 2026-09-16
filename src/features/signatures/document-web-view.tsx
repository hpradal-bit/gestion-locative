import { Fragment, type ReactNode } from "react";

import { parseDocumentBlocks, groupByHeading, toSentenceCase, type DocumentBlock } from "@/lib/document-blocks";
import { splitEmphasis } from "@/lib/emphasis";

const MAROON = "#7c2c3d";

type DocumentWebViewProps = {
  title: string;
  content: string;
  /** Rendu personnalisé de chaque case de signature (label = "Signature du Bailleur" / "...Locataire"). */
  renderSignatureSlot: (label: string) => ReactNode;
};

/** Rend un texte marqué (lib/emphasis) en mettant en gras ce qui vient de l'application. */
function Runs({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((run, index) =>
        run.bold ? (
          <strong key={index} className="font-semibold text-foreground">
            {run.text}
          </strong>
        ) : (
          run.text
        )
      )}
    </>
  );
}

/** « ci-après dénommé « le Bailleur » » → "Le bailleur". */
function partyRole(text: string): string {
  const match = text.match(/«\s*(le|la)\s+([^»(]+)/i);
  if (!match) return "La partie";
  return toSentenceCase(`${match[1]} ${match[2]}`.trim());
}

type PartyGroup = { kind: "parties"; parties: { role: string; text: string }[] };
type FrontMatterItem = { kind: "block"; block: DocumentBlock } | PartyGroup;

/** Regroupe les lignes « party » consécutives (Bailleur / ET / Locataire) en un seul encadré à deux colonnes. */
function groupFrontMatter(blocks: DocumentBlock[]): FrontMatterItem[] {
  const items: FrontMatterItem[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "party") {
      let j = i + 1;
      const run: DocumentBlock[] = [block];
      while (j < blocks.length && (blocks[j].type === "party" || blocks[j].type === "solo")) {
        run.push(blocks[j]);
        j++;
      }
      const parties = run
        .filter((b): b is Extract<DocumentBlock, { type: "party" }> => b.type === "party")
        .map((b) => ({ role: partyRole(b.text), text: b.text }));
      items.push({ kind: "parties", parties });
      i = j;
    } else {
      items.push({ kind: "block", block });
      i++;
    }
  }
  return items;
}

/**
 * Lecture web du document — même contenu que le PDF, même découpage
 * (lib/document-blocks), mais mise en page HTML/Tailwind pour un rendu
 * rapide dans le navigateur. Les informations reprises depuis l'application
 * (nom, adresse, montants...) apparaissent en gras, pour que le bailleur et
 * le locataire les repèrent d'un coup d'œil au milieu du texte juridique
 * fixe. Les cases de signature sont déléguées au parent, qui sait qui
 * consulte la page (le signataire ou l'autre partie).
 */
export function DocumentWebView({ title, content, renderSignatureSlot }: DocumentWebViewProps) {
  const blocks = parseDocumentBlocks(content);
  const signatureBlock = blocks.find((b): b is Extract<DocumentBlock, { type: "signature" }> => b.type === "signature");
  const bodyBlocks = blocks.filter((b) => b.type !== "signature");

  const firstHeadingIndex = bodyBlocks.findIndex((b) => b.type === "heading");
  const frontMatter = groupFrontMatter(
    firstHeadingIndex === -1 ? bodyBlocks : bodyBlocks.slice(0, firstHeadingIndex)
  );
  const articleGroups = groupByHeading(firstHeadingIndex === -1 ? [] : bodyBlocks.slice(firstHeadingIndex));
  const introItemIndex = frontMatter.findIndex(
    (item) => item.kind === "block" && item.block.type === "paragraph"
  );

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: MAROON, fontVariant: "small-caps" }}
        >
          Contrat de location
        </p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{title}</h1>
        <div className="mt-4 h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        {frontMatter.map((item, index) => {
          if (item.kind === "parties") {
            return (
              <div
                key={index}
                className="rounded-2xl p-5"
                style={{
                  display: "grid",
                  alignItems: "start",
                  gap: "0.75rem",
                  backgroundColor: "#f7ead9",
                  gridTemplateColumns: item.parties.length === 2 ? "1fr auto 1fr" : "1fr",
                }}
              >
                {item.parties.map((party, partyIndex) => (
                  <Fragment key={party.role + partyIndex}>
                    {partyIndex === 1 && (
                      <p key="et" className="self-center pt-1 text-xs italic text-muted-foreground">
                        et
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <p
                        className="text-sm font-bold"
                        style={{ color: MAROON, fontVariant: "small-caps" }}
                      >
                        {party.role}
                      </p>
                      <p className="text-foreground">
                        <Runs text={party.text} />
                      </p>
                    </div>
                  </Fragment>
                ))}
              </div>
            );
          }

          const block = item.block;
          switch (block.type) {
            case "paragraph": {
              if (index === introItemIndex) {
                return (
                  <div
                    key={index}
                    className="rounded-2xl p-5 text-justify italic"
                    style={{ backgroundColor: "#f7ead9", borderLeft: `4px solid ${MAROON}`, color: "#6b4a4f" }}
                  >
                    <Runs text={block.text} />
                  </div>
                );
              }
              return (
                <p key={index} className="text-justify">
                  <Runs text={block.text} />
                </p>
              );
            }
            case "divider":
              return (
                <p
                  key={index}
                  className="mt-2 text-center text-sm font-bold"
                  style={{ color: MAROON, fontVariant: "small-caps" }}
                >
                  {toSentenceCase(block.label)}
                </p>
              );
            case "solo":
              return null;
            case "smallprint":
              return (
                <p key={index} className="mt-4 border-t pt-2 text-xs text-muted-foreground">
                  <Runs text={block.text} />
                </p>
              );
            default:
              return null;
          }
        })}

        {articleGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="pl-4" style={{ borderLeft: `2px solid ${MAROON}` }}>
            {group.map((block, index) => {
              if (block.type === "heading") {
                return (
                  <p key={index} className="text-[15px] font-bold text-foreground">
                    <span style={{ color: MAROON }}>{toSentenceCase(block.label)}</span>
                    {block.rest ? ` — ${toSentenceCase(block.rest)}` : ""}
                  </p>
                );
              }
              if (block.type === "paragraph") {
                return (
                  <p key={index} className="mt-1.5 text-justify text-foreground">
                    <Runs text={block.text} />
                  </p>
                );
              }
              return null;
            })}
          </div>
        ))}

        {signatureBlock && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {signatureBlock.labels.map((label) => (
              <div key={label} className="flex flex-col gap-2">
                <p className="text-xs font-semibold" style={{ color: MAROON }}>
                  {label}
                </p>
                {renderSignatureSlot(label)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
