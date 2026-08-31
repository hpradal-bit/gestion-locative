import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { WorkForm } from "@/features/works/work-form";
import { updateWork } from "@/features/works/actions";
import { getWork } from "@/features/works/queries";
import { listProperties } from "@/features/properties/queries";

export default async function ModifierChantierPage({
  params,
}: PageProps<"/travaux/[id]/modifier">) {
  const { id } = await params;
  const [work, properties] = await Promise.all([getWork(id), listProperties()]);

  if (!work) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Modifier le chantier" />
      <WorkForm
        work={work}
        properties={properties}
        action={updateWork.bind(null, work.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
