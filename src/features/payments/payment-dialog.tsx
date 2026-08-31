"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/shared/money-input";
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
import { recordPayment } from "./actions";
import { paymentMethods } from "./schema";

const PAYMENT_METHOD_LABELS: Record<(typeof paymentMethods)[number], string> = {
  virement: "Virement",
  especes: "Espèces",
  cheque: "Chèque",
  prelevement: "Prélèvement",
  autre: "Autre",
};

type PaymentDialogProps = {
  scheduleId: string;
  remainingDue: number;
  trigger: React.ReactNode;
};

export function PaymentDialog({ scheduleId, remainingDue, trigger }: PaymentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(recordPayment, { error: null });

  React.useEffect(() => {
    if (!state.success) return;
    toast.success("Paiement enregistré");
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
    // `state` (pas seulement state.success) : useActionState renvoie un nouvel
    // objet à chaque soumission, y compris pour deux succès identiques d'affilée.
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="rent_schedule_id" value={scheduleId} />
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              Le statut de l&apos;échéance se met à jour automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Montant</Label>
            <MoneyInput id="amount" name="amount" defaultValue={remainingDue} autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paid_at">Date du paiement</Label>
            <Input id="paid_at" name="paid_at" type="date" defaultValue={today} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment_method">Moyen de paiement</Label>
            <Select name="payment_method">
              <SelectTrigger id="payment_method" className="w-full">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="comment">Commentaire</Label>
            <Input id="comment" name="comment" placeholder="Optionnel" />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
