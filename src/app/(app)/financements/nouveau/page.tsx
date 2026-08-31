import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LoanForm } from "@/features/loans/loan-form";
import { createLoan } from "@/features/loans/actions";
import { listProperties } from "@/features/properties/queries";

export const metadata: Metadata = { title: "Ajouter un crédit" };

export default async function NouveauCreditPage() {
  const properties = await listProperties();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Ajouter un crédit" />
      <LoanForm properties={properties} action={createLoan} submitLabel="Créer le crédit" />
    </div>
  );
}
