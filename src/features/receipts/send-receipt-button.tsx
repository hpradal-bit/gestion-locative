"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendReceiptEmail } from "./actions";

export function SendReceiptButton({ scheduleId }: { scheduleId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await sendReceiptEmail(scheduleId);
            toast.success("Quittance envoyée par email");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Impossible d'envoyer la quittance."
            );
          }
        });
      }}
    >
      <Send />
      {isPending ? "Envoi..." : "Envoyer la quittance"}
    </Button>
  );
}
