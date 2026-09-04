import { Percent } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPropertyTaxBreakdowns } from "@/features/taxes/queries";
import { PropertyTaxCard } from "@/features/taxes/property-tax-card";
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

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Détail par bien</TabsTrigger>
          <TabsTrigger value="guide">Guide de déclaration</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="flex flex-col gap-4">
          {breakdowns.map((breakdown) => (
            <PropertyTaxCard key={breakdown.propertyId} breakdown={breakdown} />
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
