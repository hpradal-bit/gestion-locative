"use client";

import * as React from "react";
import { FileOutput, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import { sendLeaseDocumentEmail } from "./lease-document-actions";

type LeaseOption = {
  id: string;
  label: string;
};

type LeaseDocumentGeneratorProps = {
  templates: Tables<"document_templates">[];
  leases: LeaseOption[];
  defaultTemplateId?: string;
};

export function LeaseDocumentGenerator({
  templates,
  leases,
  defaultTemplateId,
}: LeaseDocumentGeneratorProps) {
  const [templateId, setTemplateId] = React.useState<string | undefined>(
    defaultTemplateId ?? templates[0]?.id
  );
  const [leaseId, setLeaseId] = React.useState<string | undefined>(undefined);
  const [isSending, startTransition] = React.useTransition();

  const ready = Boolean(templateId && leaseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Générer un bail</CardTitle>
        <CardDescription>
          Choisissez un modèle puis un locataire — le loyer, les charges, les coordonnées et les
          dates de son bail actif sont repris automatiquement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="template">Modèle</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lease">Locataire</Label>
            <Select value={leaseId} onValueChange={setLeaseId}>
              <SelectTrigger id="lease" className="w-full">
                <SelectValue placeholder="Choisir un locataire" />
              </SelectTrigger>
              <SelectContent>
                {leases.map((lease) => (
                  <SelectItem key={lease.id} value={lease.id}>
                    {lease.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={!ready} asChild={ready}>
            {ready ? (
              <a href={`/api/modeles/${templateId}/generer?leaseId=${leaseId}`} target="_blank" rel="noreferrer">
                <FileOutput />
                Aperçu / Télécharger
              </a>
            ) : (
              <>
                <FileOutput />
                Aperçu / Télécharger
              </>
            )}
          </Button>
          <Button
            disabled={!ready || isSending}
            onClick={() => {
              if (!templateId || !leaseId) return;
              startTransition(async () => {
                try {
                  await sendLeaseDocumentEmail(templateId, leaseId);
                  toast.success("Document envoyé par email au locataire");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Impossible d'envoyer le document."
                  );
                }
              });
            }}
          >
            <Send />
            {isSending ? "Envoi..." : "Envoyer par email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
