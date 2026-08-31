import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { createExpense } from "@/features/expenses/actions";
import { listProperties } from "@/features/properties/queries";

export const metadata: Metadata = { title: "Ajouter une dépense" };

export default async function NouvelleDepensePage() {
  const properties = await listProperties();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Ajouter une dépense" />
      <ExpenseForm properties={properties} action={createExpense} submitLabel="Créer la dépense" />
    </div>
  );
}
