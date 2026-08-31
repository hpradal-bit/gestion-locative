import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { LoanForm } from "@/features/loans/loan-form";
import { updateLoan } from "@/features/loans/actions";
import { getLoan } from "@/features/loans/queries";
import { listProperties } from "@/features/properties/queries";

export default async function ModifierCreditPage({
  params,
}: PageProps<"/financements/[id]/modifier">) {
  const { id } = await params;
  const [loan, properties] = await Promise.all([getLoan(id), listProperties()]);

  if (!loan) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Modifier le crédit" />
      <LoanForm
        loan={loan}
        properties={properties}
        action={updateLoan.bind(null, loan.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
