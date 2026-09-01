import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { duplicateSimulation, deleteSimulation } from "./actions";
import type { SavedSimulation } from "./queries";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SavedSimulationsList({ simulations }: { simulations: SavedSimulation[] }) {
  if (simulations.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-0">
        {simulations.map((simulation) => (
          <div key={simulation.id} className="flex items-center justify-between gap-2 p-4">
            <Link href={`/simulateur/${simulation.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{simulation.name}</p>
              <p className="text-xs text-muted-foreground">
                Modifiée le {formatDate(simulation.updated_at)}
              </p>
            </Link>
            <div className="flex shrink-0 gap-1">
              <form action={duplicateSimulation.bind(null, simulation.id)}>
                <Button size="sm" variant="ghost" type="submit">
                  <Copy />
                  Dupliquer
                </Button>
              </form>
              <ConfirmDialog
                trigger={
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                }
                title="Supprimer cette simulation ?"
                description="Cette action est irréversible."
                confirmLabel="Supprimer"
                action={deleteSimulation.bind(null, simulation.id)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
