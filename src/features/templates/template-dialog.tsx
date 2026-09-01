"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { templateCategories, TEMPLATE_CATEGORY_LABELS, LEASE_TEMPLATE_VARIABLES } from "./constants";
import type { TemplateActionState } from "./actions";

type TemplateDialogProps = {
  trigger: React.ReactNode;
  template?: Tables<"document_templates">;
  action: (state: TemplateActionState, formData: FormData) => Promise<TemplateActionState>;
};

export function TemplateDialog({ trigger, template, action }: TemplateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [content, setContent] = React.useState(template?.content ?? "");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (state.success) {
      toast.success("Modèle enregistré");
      const id = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [state]);

  function insertVariable(key: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const token = `{{${key}}}`;
    const next = content.slice(0, start) + token + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{template ? "Modifier le modèle" : "Nouveau modèle"}</DialogTitle>
            <DialogDescription>
              Utilisez des variables comme {"{{nom_locataire}}"} : elles seront remplacées
              automatiquement par les données réelles à la génération.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom du modèle</Label>
              <Input id="name" name="name" defaultValue={template?.name ?? ""} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select name="category" defaultValue={template?.category ?? "autre"}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {TEMPLATE_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {LEASE_TEMPLATE_VARIABLES.map((variable) => (
              <Button
                key={variable.key}
                type="button"
                size="sm"
                variant="outline"
                title={variable.description}
                onClick={() => insertVariable(variable.key)}
              >
                {`{{${variable.key}}}`}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              ref={textareaRef}
              id="content"
              name="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
