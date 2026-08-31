import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { updateExpense } from "@/features/expenses/actions";
import { getExpense } from "@/features/expenses/queries";
import { listProperties } from "@/features/properties/queries";

export default async function ModifierDepensePage({
  params,
}: PageProps<"/depenses/[id]/modifier">) {
  const { id } = await params;
  const [expense, properties] = await Promise.all([getExpense(id), listProperties()]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Modifier la dépense" />
      <ExpenseForm
        expense={expense}
        properties={properties}
        action={updateExpense.bind(null, expense.id)}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
