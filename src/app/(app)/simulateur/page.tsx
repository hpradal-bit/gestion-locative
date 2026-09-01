import { PageHeader } from "@/components/shared/page-header";
import { Simulator } from "@/features/simulator/simulator";
import { SavedSimulationsList } from "@/features/simulator/saved-simulations-list";
import { listSimulations } from "@/features/simulator/queries";

export default async function SimulateurPage() {
  const simulations = await listSimulations();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Simulateur"
        description="Simulez un nouveau projet immobilier et comparez des scénarios."
      />

      {simulations.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Mes simulations</h2>
          <SavedSimulationsList simulations={simulations} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Nouvelle simulation</h2>
        <Simulator />
      </div>
    </div>
  );
}
