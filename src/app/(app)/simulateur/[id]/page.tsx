import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Simulator } from "@/features/simulator/simulator";
import { getSimulation } from "@/features/simulator/queries";

export default async function SimulationDetailPage({
  params,
}: PageProps<"/simulateur/[id]">) {
  const { id } = await params;
  const simulation = await getSimulation(id);

  if (!simulation) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title={simulation.name} description="Simulation enregistrée." />
      <Simulator
        simulationId={simulation.id}
        initialName={simulation.name}
        initialInput={simulation.input}
      />
    </div>
  );
}
