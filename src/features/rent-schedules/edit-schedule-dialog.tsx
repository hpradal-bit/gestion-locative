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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRentSchedule } from "./actions";

type EditScheduleDialogProps = {
  scheduleId: string;
  dueDate: string;
  rentAmount: number;
  chargesAmount: number;
};

export function EditScheduleDialog({
  scheduleId,
  dueDate,
  rentAmount,
  chargesAmount,
}: EditScheduleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const action = updateRentSchedule.bind(null, scheduleId);
  const [state, formAction, pending] = useActionState(action, { error: null });

  React.useEffect(() => {
    if (!state.success) return;
    toast.success("Échéance modifiée");
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Modifier cette échéance">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;échéance</DialogTitle>
            <DialogDescription>
              Corrige la date ou les montants d&apos;une échéance mal renseignée. Cette
              modification ne change pas le bail ni les autres échéances.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`due_date-${scheduleId}`}>Date d&apos;échéance</Label>
            <Input
              id={`due_date-${scheduleId}`}
              name="due_date"
              type="date"
              defaultValue={dueDate}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`rent_amount-${scheduleId}`}>Loyer</Label>
            <MoneyInput id={`rent_amount-${scheduleId}`} name="rent_amount" defaultValue={rentAmount} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`charges_amount-${scheduleId}`}>Charges</Label>
            <MoneyInput
              id={`charges_amount-${scheduleId}`}
              name="charges_amount"
              defaultValue={chargesAmount}
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
