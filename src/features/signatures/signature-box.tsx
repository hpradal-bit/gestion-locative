"use client";

import * as React from "react";
import { useActionState } from "react";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { PenLine, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signDocument } from "./actions";

const caveat = localFont({ src: "../../../public/fonts/Caveat-Regular.ttf" });

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

type SignedSignatureBoxProps = { label: string; name: string; signedAt: string };

export function SignedSignatureBox({ name, signedAt }: SignedSignatureBoxProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
      <p className={`${caveat.className} text-2xl text-[#1c2b45]`}>{name}</p>
      <p className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
        <CircleCheck className="size-3.5" />
        Signé le {formatSignedAt(signedAt)} — validé, non modifiable
      </p>
    </div>
  );
}

export function PendingSignatureBox({ label }: { label: string }) {
  return (
    <div className="flex h-[70px] items-center justify-center rounded-md border border-dashed p-3 text-xs text-muted-foreground">
      En attente de la signature{label.toLowerCase().includes("bailleur") ? " du Bailleur" : " du Locataire"}
    </div>
  );
}

type SignatureBoxProps = { token: string; label: string };

export function SignatureBox({ token, label }: SignatureBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const router = useRouter();
  const action = signDocument.bind(null, token);
  const [state, formAction, pending] = useActionState(action, { error: null });

  const wasSuccess = state.success;
  React.useEffect(() => {
    if (wasSuccess) {
      React.startTransition(() => {
        setOpen(false);
        router.refresh();
      });
    }
  }, [wasSuccess, router]);

  const previewName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[70px] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#1c2b45] bg-[#1c2b45]/5 text-[#1c2b45] transition hover:bg-[#1c2b45]/10"
      >
        <PenLine className="size-4" />
        <span className="text-xs font-medium">Cliquez ici pour signer</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signer en tant que {label.replace("Signature du ", "")}</DialogTitle>
            <DialogDescription>
              Indiquez votre prénom et votre nom : ils serviront à générer votre signature, avec la
              date et l&apos;heure exactes.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Aperçu de votre signature</Label>
              <div className="flex h-16 items-center justify-center rounded-md border bg-muted/30">
                <p className={`${caveat.className} text-3xl text-[#1c2b45]`}>
                  {previewName || "Votre signature"}
                </p>
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={pending || !firstName.trim() || !lastName.trim()}>
                {pending ? "Signature en cours..." : "Signer et valider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
