"use client";

import * as React from "react";
import Link from "next/link";
import { FileOutput, Send, TriangleAlert, CircleCheck } from "lucide-react";
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
import { checkMissingVariables, type MissingVariable } from "./check-missing-variables";

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
  const [missing, setMissing] = React.useState<MissingVariable[] | null>(null);
  const [isChecking, startCheckTransition] = React.useTransition();

  const ready = Boolean(templateId && leaseId);

  React.useEffect(() => {
    if (!templateId || !leaseId) return;
    let cancelled = false;
    startCheckTransition(async () => {
      const result = await checkMissingVariables(templateId, leaseId);
      if (!cancelled) setMissing(result);
    });
    return () => {
      cancelled = true;
    };
  }, [templateId, leaseId]);

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

        {ready && !isChecking && missing !== null && (
          <div
            className={
              missing.length > 0
                ? "flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950"
                : "flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }
          >
            {missing.length > 0 ? (
              <>
                <div className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-300">
                  <TriangleAlert className="size-4" />
                  {missing.length} information{missing.length > 1 ? "s" : ""} manquante
                  {missing.length > 1 ? "s" : ""}
                </div>
                <ul className="flex flex-col gap-1">
                  {missing.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200"
                      >
                        {item.description} → à compléter dans « {item.locationLabel} »
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <CircleCheck className="size-4" />
                Toutes les informations utilisées par ce modèle sont renseignées.
              </>
            )}
          </div>
        )}

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
