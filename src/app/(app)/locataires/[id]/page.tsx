import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenant } from "@/features/tenants/queries";
import { deleteTenant } from "@/features/tenants/actions";
import { getLeasesForTenant } from "@/features/leases/queries";
import { deleteLease, endLease } from "@/features/leases/actions";
import { formatCurrency } from "@/lib/format";
import { DocumentsSection } from "@/features/documents/documents-section";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function LocataireDetailPage({
  params,
}: PageProps<"/locataires/[id]">) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    notFound();
  }

  const leases = await getLeasesForTenant(id);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`${tenant.first_name} ${tenant.last_name}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/locataires/${tenant.id}/modifier`}>
                <Pencil />
                Modifier
              </Link>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 />
                  Supprimer
                </Button>
              }
              title="Supprimer ce locataire ?"
              description="Cette action est irréversible. Le locataire et ses baux seront supprimés."
              confirmLabel="Supprimer"
              action={deleteTenant.bind(null, tenant.id)}
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Email" value={tenant.email ?? "—"} />
          <InfoRow label="Téléphone" value={tenant.phone ?? "—"} />
          <InfoRow label="Adresse" value={tenant.address ?? "—"} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Baux</h2>
        <Button asChild size="sm">
          <Link href={`/locataires/${tenant.id}/baux/nouveau`}>
            <Plus />
            Créer un bail
          </Link>
        </Button>
      </div>

      {leases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun bail pour l'instant"
          description="Créez un bail pour associer ce locataire à un bien et générer automatiquement ses échéances de loyer."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {leases.map((lease) => (
            <Card key={lease.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{lease.properties?.name ?? "Bien supprimé"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Du {lease.start_date}
                    {lease.end_date ? ` au ${lease.end_date}` : ""}
                  </p>
                </div>
                <Badge variant={lease.status === "active" ? "success" : "secondary"}>
                  {lease.status === "active" ? "Actif" : "Terminé"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow label="Loyer" value={formatCurrency(lease.initial_rent)} />
                <InfoRow label="Charges" value={formatCurrency(lease.charges)} />
                <InfoRow label="Dépôt de garantie" value={formatCurrency(lease.security_deposit)} />
                {lease.status === "active" && (
                  <div className="flex justify-end gap-2 pt-2">
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          Mettre fin au bail
                        </Button>
                      }
                      title="Mettre fin à ce bail ?"
                      description="Le bail sera marqué comme terminé à la date du jour. Cette action ne supprime pas l'historique des paiements."
                      confirmLabel="Mettre fin au bail"
                      variant="default"
                      action={endLease.bind(null, lease.id, tenant.id)}
                    />
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Supprimer
                        </Button>
                      }
                      title="Supprimer ce bail ?"
                      description="Cette action est irréversible et supprimera aussi ses échéances et paiements associés."
                      confirmLabel="Supprimer"
                      action={deleteLease.bind(null, lease.id, tenant.id)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DocumentsSection entityType="tenant" entityId={tenant.id} />
    </div>
  );
}
