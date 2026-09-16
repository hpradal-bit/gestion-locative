"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getDocumentDownloadUrl } from "./actions";

/** Ouvre un document dans un nouvel onglet à partir de son chemin de stockage. */
export function useOpenDocument(storagePath: string) {
  const [loading, setLoading] = React.useState(false);

  async function open() {
    setLoading(true);
    const url = await getDocumentDownloadUrl(storagePath);
    setLoading(false);
    if (!url) {
      toast.error("Impossible d'ouvrir le document.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return { open, loading };
}

export function DownloadButton({ storagePath }: { storagePath: string }) {
  const { open, loading } = useOpenDocument(storagePath);

  return (
    <Button size="sm" variant="ghost" onClick={open} disabled={loading}>
      <Download />
      Télécharger
    </Button>
  );
}
