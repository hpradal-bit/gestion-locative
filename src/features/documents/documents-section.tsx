import { FileText, Plus, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { listDocumentsForEntity } from "./queries";
import { deleteDocument } from "./actions";
import { UploadDialog } from "./upload-dialog";
import { DownloadButton } from "./download-button";
import { DOCUMENT_TYPE_LABELS } from "./constants";
import type { documentEntityTypes, documentTypes } from "./schema";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export async function DocumentsSection({
  entityType,
  entityId,
}: {
  entityType: (typeof documentEntityTypes)[number];
  entityId: string;
}) {
  const documents = await listDocumentsForEntity(entityType, entityId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Documents</CardTitle>
        <UploadDialog
          entityType={entityType}
          entityId={entityId}
          trigger={
            <Button size="sm" variant="outline">
              <Plus />
              Ajouter
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" />
            Aucun document pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">
                        {DOCUMENT_TYPE_LABELS[doc.document_type as (typeof documentTypes)[number]] ??
                          doc.document_type}
                      </Badge>
                      {formatSize(doc.size_bytes)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <DownloadButton storagePath={doc.storage_path} />
                  <ConfirmDialog
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        <Trash2 />
                      </Button>
                    }
                    title="Supprimer ce document ?"
                    description="Cette action est irréversible."
                    confirmLabel="Supprimer"
                    action={deleteDocument.bind(null, doc.id, doc.storage_path)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
