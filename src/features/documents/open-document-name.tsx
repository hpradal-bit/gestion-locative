"use client";

import type { ReactNode } from "react";

import { useOpenDocument } from "./download-button";

/** Rend le nom du document cliquable : l'ouvre directement dans un nouvel onglet. */
export function OpenDocumentName({
  storagePath,
  children,
}: {
  storagePath: string;
  children: ReactNode;
}) {
  const { open, loading } = useOpenDocument(storagePath);

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className="min-w-0 text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:no-underline disabled:opacity-70"
    >
      {children}
    </button>
  );
}
