import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { paginate, parsePageParam } from "@/lib/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpenseFilters } from "@/features/expenses/expense-filters";
import { listExpenses } from "@/features/expenses/queries";
import { EXPENSE_CATEGORY_LABELS } from "@/features/expenses/constants";
import { expenseCategories } from "@/features/expenses/schema";
import { listProperties } from "@/features/properties/queries";
import { formatCurrency } from "@/lib/format";

type ExpenseCategory = (typeof expenseCategories)[number];
type ExpenseRow = Awaited<ReturnType<typeof listExpenses>>[number];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DepensesPage({
  searchParams,
}: PageProps<"/depenses">) {
  const params = await searchParams;
  const propertyId = typeof params.bien === "string" ? params.bien : undefined;
  const categoryParam = typeof params.categorie === "string" ? params.categorie : undefined;
  const category = expenseCategories.includes(categoryParam as ExpenseCategory)
    ? (categoryParam as ExpenseCategory)
    : undefined;

  const [allExpenses, properties] = await Promise.all([
    listExpenses({ propertyId, category }),
    listProperties(),
  ]);
  const { items: expenses, currentPage, pageCount, totalCount } = paginate(
    allExpenses,
    parsePageParam(params.page)
  );

  const columns: DataTableColumn<ExpenseRow>[] = [
    {
      header: "Bien",
      cell: (row) => row.properties?.name ?? "Bien supprimé",
    },
    {
      header: "Catégorie",
      cell: (row) => (
        <Badge variant="secondary">
          {EXPENSE_CATEGORY_LABELS[row.category as ExpenseCategory] ?? row.category}
        </Badge>
      ),
    },
    { header: "Date", cell: (row) => formatDate(row.expense_date) },
    { header: "Fournisseur", cell: (row) => row.supplier ?? "—" },
    {
      header: "Montant",
      className: "text-right",
      cell: (row) => formatCurrency(row.amount),
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/depenses/${row.id}/modifier`}>Modifier</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dépenses"
        description="Charges, travaux et autres dépenses par bien."
        action={
          <Button asChild>
            <Link href="/depenses/nouveau">
              <Plus />
              Ajouter une dépense
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune dépense pour l'instant"
          description="Ajoutez d'abord un bien pour pouvoir y associer des dépenses."
        />
      ) : (
        <>
          <ExpenseFilters properties={properties} />
          <div>
            <DataTable
              columns={columns}
              rows={expenses}
              rowKey={(row) => row.id}
              emptyMessage="Aucune dépense ne correspond à ces filtres."
            />
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              totalCount={totalCount}
              basePath="/depenses"
              searchParams={{ bien: propertyId, categorie: categoryParam }}
            />
          </div>
        </>
      )}
    </div>
  );
}
