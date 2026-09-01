"use client";

import * as React from "react";
import { useActionState } from "react";
import { Pencil } from "lucide-react";
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
import type { Tables } from "@/lib/supabase/database.types";
import { updatePayment } from "./actions";
import { paymentMethods } from "./schema";

const PAYMENT_METHOD_LABELS: Record<(typeof paymentMethods)[number], string> = {
  virement: "Virement",
  especes: "Espèces",
  cheque: "Chèque",
  prelevement: "Prélèvement",
  autre: "Autre",
};

export function EditPaymentDialog({ payment }: { payment: Tables<"payments"> }) {
  const [open, setOpen] = React.useState(false);
  const action = updatePayment.bind(null, payment.id);
  const [state, formAction, pending] = useActionState(action, { error: null });

  React.useEffect(() => {
    if (!state.success) return;
    toast.success("Paiement modifié");
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Modifier ce paiement">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Modifier le paiement</DialogTitle>
            <DialogDescription>
              Corrigez le montant, la date, le moyen de paiement ou le commentaire.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`amount-${payment.id}`}>Montant</Label>
            <MoneyInput id={`amount-${payment.id}`} name="amount" defaultValue={payment.amount} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`paid_at-${payment.id}`}>Date du paiement</Label>
            <Input
              id={`paid_at-${payment.id}`}
              name="paid_at"
              type="date"
              defaultValue={payment.paid_at}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`payment_method-${payment.id}`}>Moyen de paiement</Label>
            <Select name="payment_method" defaultValue={payment.payment_method ?? undefined}>
              <SelectTrigger id={`payment_method-${payment.id}`} className="w-full">
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
            <Label htmlFor={`comment-${payment.id}`}>Commentaire</Label>
            <Input
              id={`comment-${payment.id}`}
              name="comment"
              placeholder="Optionnel"
              defaultValue={payment.comment ?? ""}
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
