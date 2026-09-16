import type { ReactNode } from "react";

import { parseDocumentBlocks } from "@/lib/document-blocks";

type DocumentWebViewProps = {
  title: string;
  content: string;
  /** Rendu personnalisé de chaque case de signature (label = "Signature du Bailleur" / "...Locataire"). */
  renderSignatureSlot: (label: string) => ReactNode;
};

/**
 * Lecture web du document — même contenu que le PDF, même découpage
 * (lib/document-blocks), mais mise en page HTML/Tailwind pour un rendu
 * rapide dans le navigateur. Les cases de signature sont déléguées au
 * parent, qui sait qui consulte la page (le signataire ou l'autre partie).
 */
export function DocumentWebView({ title, content, renderSignatureSlot }: DocumentWebViewProps) {
  const blocks = parseDocumentBlocks(content);

  return (
    <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 shadow-sm sm:p-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-serif text-xl font-bold text-[#1c2b45]">{title}</h1>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Contrat de location
        </p>
        <div className="mt-3 h-[2px] w-16 bg-[#1c2b45]" />
      </div>

      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        {blocks.map((block, index) => {
          switch (block.type) {
            case "heading":
              return (
                <div key={index} className="mt-4 border-b pb-1.5">
                  <p className="text-[13px] font-semibold text-[#1c2b45]">
                    {block.label}
                    {block.rest ? ` — ${block.rest}` : ""}
                  </p>
                </div>
              );
            case "divider":
              return (
                <div key={index} className="my-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {block.label}
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
              );
            case "solo":
              return (
                <p key={index} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                  {block.label}
                </p>
              );
            case "party":
              return (
                <div key={index} className="border-l-2 border-[#1c2b45] bg-muted/40 px-3 py-2">
                  <p>{block.text}</p>
                </div>
              );
            case "signature":
              return (
                <div key={index} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {block.labels.map((label) => (
                    <div key={label} className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-[#1c2b45]">{label}</p>
                      {renderSignatureSlot(label)}
                    </div>
                  ))}
                </div>
              );
            case "smallprint":
              return (
                <p key={index} className="mt-4 border-t pt-2 text-xs text-muted-foreground">
                  {block.text}
                </p>
              );
            case "paragraph":
              return (
                <p key={index} className="text-justify">
                  {block.text}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
}
