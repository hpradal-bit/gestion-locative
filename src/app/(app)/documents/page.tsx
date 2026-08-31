import { FolderOpen, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DocumentFilters } from "@/features/documents/document-filters";
import { DownloadButton } from "@/features/documents/download-button";
import { listDocuments } from "@/features/documents/queries";
import { deleteDocument } from "@/features/documents/actions";
import { DOCUMENT_TYPE_LABELS } from "@/features/documents/constants";
import { ENTITY_TYPE_LABELS } from "@/features/documents/entity-labels";
import type { documentEntityTypes, documentTypes } from "@/features/documents/schema";

type DocumentRow = Awaited<ReturnType<typeof listDocuments>>[number];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DocumentsPage({
  searchParams,
}: PageProps<"/documents">) {
  const params = await searchParams;
  const entityType = typeof params.type === "string" ? params.type : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;

  const documents = await listDocuments({
    entityType: entityType as (typeof documentEntityTypes)[number] | undefined,
    search,
  });

  const columns: DataTableColumn<DocumentRow>[] = [
    { header: "Fichier", cell: (row) => row.file_name },
    {
      header: "Type",
      cell: (row) => (
        <Badge variant="secondary">
          {DOCUMENT_TYPE_LABELS[row.document_type as (typeof documentTypes)[number]] ??
            row.document_type}
        </Badge>
      ),
    },
    {
      header: "Rattaché à",
      cell: (row) =>
        ENTITY_TYPE_LABELS[row.entity_type as (typeof documentEntityTypes)[number]] ??
        row.entity_type,
    },
    { header: "Ajouté le", cell: (row) => formatDate(row.created_at) },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton storagePath={row.storage_path} />
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 />
              </Button>
            }
            title="Supprimer ce document ?"
            description="Cette action est irréversible."
            confirmLabel="Supprimer"
            action={deleteDocument.bind(null, row.id, row.storage_path)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Quittances, factures, contrats et autres documents."
      />
      <DocumentFilters />

      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document pour l'instant"
          description="Ajoutez des documents depuis la fiche d'un bien ou d'un locataire — ils apparaîtront ici."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={documents}
          rowKey={(row) => row.id}
          emptyMessage="Aucun document ne correspond à cette recherche."
        />
      )}
    </div>
  );
}
