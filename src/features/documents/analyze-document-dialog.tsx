"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ExtractedField } from "@/lib/ai/gemini";
import { analyzeLeaseDocument, applyExtractedLeaseData } from "./analyze-actions";
import { LEASE_EXTRACTION_FIELDS, APPLICABLE_LEASE_FIELDS } from "./lease-extraction";

type ApplicableField = (typeof APPLICABLE_LEASE_FIELDS)[number];

const FIELD_LABELS = Object.fromEntries(
  LEASE_EXTRACTION_FIELDS.map((f) => [f.key, f.label])
) as Record<string, string>;

const LOW_CONFIDENCE_THRESHOLD = 70;

export function AnalyzeDocumentDialog({
  documentId,
  leaseId,
  trigger,
}: {
  documentId: string;
  leaseId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "analyzing" | "reviewing">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [fields, setFields] = React.useState<ExtractedField[]>([]);
  const [values, setValues] = React.useState<Partial<Record<ApplicableField, string>>>({});
  const [applying, setApplying] = React.useState(false);

  async function runAnalysis() {
    setStatus("analyzing");
    setError(null);
    const result = await analyzeLeaseDocument(documentId);
    if (!result.success) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setFields(result.fields);
    const initialValues: Partial<Record<ApplicableField, string>> = {};
    for (const field of result.fields) {
      if ((APPLICABLE_LEASE_FIELDS as readonly string[]).includes(field.key)) {
        initialValues[field.key as ApplicableField] = field.value;
      }
    }
    setValues(initialValues);
    setStatus("reviewing");
  }

  async function handleValidate() {
    setApplying(true);
    setError(null);
    try {
      const result = await applyExtractedLeaseData(leaseId, values);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Informations du bail mises à jour");
      setOpen(false);
      setStatus("idle");
    } finally {
      setApplying(false);
    }
  }

  const infoFields = fields.filter(
    (f) => !(APPLICABLE_LEASE_FIELDS as readonly string[]).includes(f.key)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setError(null);
        } else if (status === "idle") {
          runAnalysis();
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Analyse IA du document
          </DialogTitle>
          <DialogDescription>
            Vérifiez et corrigez les informations détectées avant de les appliquer au bail —
            rien n&apos;est enregistré tant que vous n&apos;avez pas validé.
          </DialogDescription>
        </DialogHeader>

        {status === "analyzing" && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Analyse du document en cours...
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {status === "reviewing" && (
          <div className="flex flex-col gap-4">
            {infoFields.length > 0 && (
              <div className="flex flex-col gap-1 rounded-md border p-3 text-sm">
                {infoFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">
                      {FIELD_LABELS[field.key] ?? field.key}
                    </span>
                    <span className="flex items-center gap-2">
                      {field.value}
                      {field.confidence < LOW_CONFIDENCE_THRESHOLD && (
                        <Badge variant="warning">⚠️ à vérifier</Badge>
                      )}
                    </span>
                  </div>
                ))}
                <p className="mt-1 text-xs text-muted-foreground">
                  Informations affichées à titre indicatif — non modifiées automatiquement.
                </p>
              </div>
            )}

            {APPLICABLE_LEASE_FIELDS.map((key) => {
              const detected = fields.find((f) => f.key === key);
              return (
                <div key={key} className="flex flex-col gap-2">
                  <Label htmlFor={`field-${key}`} className="flex items-center gap-2">
                    {FIELD_LABELS[key]}
                    {detected && detected.confidence < LOW_CONFIDENCE_THRESHOLD && (
                      <Badge variant="warning">⚠️ confiance faible</Badge>
                    )}
                  </Label>
                  <Input
                    id={`field-${key}`}
                    value={values[key] ?? ""}
                    placeholder={detected ? undefined : "Non détecté"}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          {status === "reviewing" && (
            <Button onClick={handleValidate} disabled={applying}>
              {applying ? "Enregistrement..." : "Valider et appliquer au bail"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
