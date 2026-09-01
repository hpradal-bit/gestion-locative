"use client";

import * as React from "react";
import { FileOutput } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tables } from "@/lib/supabase/database.types";

type GenerateDocumentButtonProps = {
  leaseId: string;
  templates: Tables<"document_templates">[];
};

export function GenerateDocumentButton({ leaseId, templates }: GenerateDocumentButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [templateId, setTemplateId] = React.useState<string | undefined>(templates[0]?.id);

  if (templates.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileOutput />
          Générer un document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Générer un document depuis un modèle</DialogTitle>
          <DialogDescription>
            Les variables du modèle seront remplacées par les informations de ce bail.
          </DialogDescription>
        </DialogHeader>

        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger className="w-full">
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

        <DialogFooter>
          <Button
            disabled={!templateId}
            onClick={() => {
              if (!templateId) return;
              window.open(`/api/modeles/${templateId}/generer?leaseId=${leaseId}`, "_blank");
              setOpen(false);
            }}
          >
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
