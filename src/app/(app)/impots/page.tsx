import { Percent } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPropertyTaxBreakdowns } from "@/features/taxes/queries";
import { RegimeSimulationCard } from "@/features/taxes/regime-simulation-card";
import { RegimeSelectorCard } from "@/features/taxes/regime-selector-card";
import { DeclarationGuideCard } from "@/features/taxes/declaration-guide-card";
import { DECLARATION_GUIDE } from "@/features/taxes/declaration-guide";
import { taxRegimes } from "@/lib/finance";

export default async function ImpotsPage() {
  const breakdowns = await getPropertyTaxBreakdowns();

  if (breakdowns.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <PageHeader
          title="Impôts"
          description="Comprendre, bien par bien, comment votre impôt est calculé."
        />
        <EmptyState
          icon={Percent}
          title="Aucun bien pour l'instant"
          description="Ajoutez un bien pour voir apparaître ici le détail de son calcul fiscal."
        />
      </div>
    );
  }

  // Les régimes effectivement utilisés d'abord, pour que le guide commence
  // par ce qui concerne vraiment l'utilisateur.
  const usedRegimes = new Set(breakdowns.map((b) => b.regime).filter((r): r is NonNullable<typeof r> => r != null));
  const orderedRegimes = [...taxRegimes].sort((a, b) => {
    const aUsed = usedRegimes.has(a) ? 0 : 1;
    const bUsed = usedRegimes.has(b) ? 0 : 1;
    return aUsed - bUsed;
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Impôts"
        description="Comprendre, bien par bien, comment votre impôt est calculé — et comment le déclarer."
      />

      <Tabs defaultValue="simulation">
        <TabsList>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="regime">Choisir le régime</TabsTrigger>
          <TabsTrigger value="guide">Guide de déclaration</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Pour chaque bien, comparez les 4 régimes fiscaux avec ses revenus et charges réels.
            Cliquez sur une case pour en voir le détail du calcul.
          </p>
          {breakdowns.map((breakdown) => (
            <RegimeSimulationCard key={breakdown.propertyId} breakdown={breakdown} />
          ))}
        </TabsContent>

        <TabsContent value="regime" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Choisissez le régime fiscal retenu pour chaque bien — il sera utilisé pour toutes vos
            estimations (tableau de bord, rentabilité, cash-flow après impôt).
          </p>
          {breakdowns.map((breakdown) => (
            <RegimeSelectorCard key={breakdown.propertyId} breakdown={breakdown} />
          ))}
        </TabsContent>

        <TabsContent value="guide" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Comment déclarer vos revenus immobiliers sur votre déclaration de revenus, régime par
            régime. Ceci reste une estimation pédagogique, pas un conseil fiscal personnalisé —
            vérifiez toujours les cases exactes de l&apos;année en cours sur impots.gouv.fr ou avec
            votre comptable.
          </p>
          {orderedRegimes.map((regime) => (
            <DeclarationGuideCard key={regime} guide={DECLARATION_GUIDE[regime]} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
