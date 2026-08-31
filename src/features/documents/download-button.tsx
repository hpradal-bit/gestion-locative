"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getDocumentDownloadUrl } from "./actions";

export function DownloadButton({ storagePath }: { storagePath: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleClick() {
    setLoading(true);
    const url = await getDocumentDownloadUrl(storagePath);
    setLoading(false);
    if (!url) {
      toast.error("Impossible de générer le lien de téléchargement.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleClick} disabled={loading}>
      <Download />
      Télécharger
    </Button>
  );
}
