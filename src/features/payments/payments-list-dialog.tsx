"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Tables } from "@/lib/supabase/database.types";
import { formatCurrency } from "@/lib/format";
import { deletePayment } from "./actions";
import { EditPaymentDialog } from "./edit-payment-dialog";
import { paymentMethods } from "./schema";

const PAYMENT_METHOD_LABELS: Record<(typeof paymentMethods)[number], string> = {
  virement: "Virement",
  especes: "Espèces",
  cheque: "Chèque",
  prelevement: "Prélèvement",
  autre: "Autre",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PaymentsListDialog({
  payments,
  trigger,
}: {
  payments: Tables<"payments">[];
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paiements de cette échéance</DialogTitle>
          <DialogDescription>
            Modifiez ou supprimez un paiement enregistré par erreur.
          </DialogDescription>
        </DialogHeader>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.paid_at)}
                    {payment.payment_method &&
                      ` — ${PAYMENT_METHOD_LABELS[payment.payment_method as (typeof paymentMethods)[number]] ?? payment.payment_method}`}
                    {payment.comment ? ` — ${payment.comment}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <EditPaymentDialog payment={payment} />
                  <ConfirmDialog
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer ce paiement"
                      >
                        <Trash2 />
                      </Button>
                    }
                    title="Supprimer ce paiement ?"
                    description="Cette action est irréversible et recalculera le statut de l'échéance."
                    confirmLabel="Supprimer"
                    action={deletePayment.bind(null, payment.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
