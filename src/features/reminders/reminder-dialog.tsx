"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendReminder } from "./actions";

const LEVEL_LABELS: Record<string, string> = {
  "1": "Niveau 1 — Rappel cordial",
  "2": "Niveau 2 — Relance ferme",
  "3": "Niveau 3 — Mise en demeure",
};

export function ReminderDialog({
  scheduleId,
  trigger,
  lastReminderAt,
  isRecentReminder = false,
}: {
  scheduleId: string;
  trigger: React.ReactNode;
  /** Date d'envoi de la dernière relance sur cette échéance, si connue. */
  lastReminderAt?: string | null;
  /** Calculé côté serveur (< 3 jours) pour éviter un Date.now() impur pendant le rendu client. */
  isRecentReminder?: boolean;
}) {
  const isRecent = isRecentReminder;
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(sendReminder, { error: null });

  React.useEffect(() => {
    if (state.success) {
      toast.success("Relance envoyée");
      const id = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="rent_schedule_id" value={scheduleId} />
          <DialogHeader>
            <DialogTitle>Relancer le locataire</DialogTitle>
            <DialogDescription>
              Choisissez le niveau de relance adapté à la situation.
            </DialogDescription>
          </DialogHeader>

          {lastReminderAt && (
            <p
              className={
                isRecent
                  ? "rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
                  : "text-sm text-muted-foreground"
              }
            >
              {isRecent ? "⚠️ " : ""}Dernière relance envoyée le{" "}
              {new Date(lastReminderAt).toLocaleDateString("fr-FR")}
              {isRecent ? " — il y a moins de 3 jours." : "."}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="level">Niveau de relance</Label>
            <Select name="level" defaultValue="1">
              <SelectTrigger id="level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Envoi..." : "Envoyer la relance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
