"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SimulationInput } from "@/lib/finance";
import { createSimulation, updateSimulation } from "./actions";

type SaveSimulationDialogProps = {
  input: SimulationInput;
  /** Présent uniquement en édition d'une simulation déjà sauvegardée. */
  simulationId?: string;
  defaultName?: string;
  trigger: React.ReactNode;
};

export function SaveSimulationDialog({
  input,
  simulationId,
  defaultName,
  trigger,
}: SaveSimulationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(defaultName ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = simulationId
        ? await updateSimulation(simulationId, name, input)
        : await createSimulation(name, input);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Simulation enregistrée");
      setOpen(false);
      if (!simulationId && result.id) {
        router.push(`/simulateur/${result.id}`);
      } else {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {simulationId ? "Enregistrer les modifications" : "Enregistrer la simulation"}
            </DialogTitle>
            <DialogDescription>
              Donnez un nom à cette simulation pour la retrouver plus tard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="simulation-name">Nom de la simulation</Label>
            <Input
              id="simulation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex : Appartement Paris 2026"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
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
