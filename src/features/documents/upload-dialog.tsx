"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createClient } from "@/lib/supabase/client";
import { recordDocument } from "./actions";
import { documentFileSchema, documentTypes } from "./schema";
import { DOCUMENT_TYPE_LABELS } from "./constants";
import type { documentEntityTypes, documentTypes as DocumentTypes } from "./schema";

const GENERIC_ERROR = "Impossible d'importer le document. Vérifiez le fichier puis réessayez.";

type UploadDialogProps = {
  entityType: (typeof documentEntityTypes)[number];
  entityId: string;
  trigger: React.ReactNode;
};

export function UploadDialog({ entityType, entityId, trigger }: UploadDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [documentType, setDocumentType] = React.useState<(typeof DocumentTypes)[number]>("autres");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const fileInput = formRef.current?.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    const parsedFile = documentFileSchema.safeParse(file);
    if (!parsedFile.success) {
      setError(parsedFile.error.issues[0]?.message ?? GENERIC_ERROR);
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(GENERIC_ERROR);
        return;
      }

      const storagePath = `${user.id}/${entityType}/${entityId}/${Date.now()}-${parsedFile.data.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, parsedFile.data, {
          contentType: parsedFile.data.type || undefined,
        });

      if (uploadError) {
        setError(GENERIC_ERROR);
        return;
      }

      const result = await recordDocument({
        entity_type: entityType,
        entity_id: entityId,
        document_type: documentType,
        file_name: parsedFile.data.name,
        storage_path: storagePath,
        size_bytes: parsedFile.data.size,
      });

      if (result.error) {
        await supabase.storage.from("documents").remove([storagePath]);
        setError(result.error);
        return;
      }

      toast.success("Document importé");
      formRef.current?.reset();
      setDocumentType("autres");
      setOpen(false);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>PDF, image ou autre fichier — 10 Mo maximum.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="document_type">Type de document</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as (typeof DocumentTypes)[number])}
            >
              <SelectTrigger id="document_type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Fichier</Label>
            <Input id="file" name="file" type="file" required />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Import..." : "Importer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
