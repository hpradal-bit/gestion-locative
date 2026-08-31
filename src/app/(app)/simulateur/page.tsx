import { PageHeader } from "@/components/shared/page-header";
import { Simulator } from "@/features/simulator/simulator";

export default function SimulateurPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Simulateur"
        description="Simulez un nouveau projet immobilier et comparez des scénarios."
      />
      <Simulator />
    </div>
  );
}
