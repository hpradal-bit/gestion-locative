import { History } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { listActivityEvents } from "@/features/activity/queries";
import { ACTIVITY_ACTION_EMOJI, ACTIVITY_ACTION_LABELS } from "@/features/activity/constants";
import type { ActivityAction } from "@/features/activity/log";
import type { Tables } from "@/lib/supabase/database.types";

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default async function HistoriquePage() {
  const events = await listActivityEvents();

  const columns: DataTableColumn<Tables<"activity_events">>[] = [
    {
      header: "Date",
      className: "whitespace-nowrap",
      cell: (row) => {
        const { date, time } = formatDateTime(row.created_at);
        return (
          <div>
            <p className="font-medium">{date}</p>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
        );
      },
    },
    {
      header: "Action",
      cell: (row) => {
        const action = row.action as ActivityAction;
        return (
          <span>
            {ACTIVITY_ACTION_EMOJI[action] ?? "•"} {ACTIVITY_ACTION_LABELS[action] ?? row.action}
          </span>
        );
      },
    },
    {
      header: "Détail",
      cell: (row) => <span className="text-muted-foreground">{row.entity_label}</span>,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Historique"
        description="Journal des actions importantes : relances, quittances, paiements, baux, documents, biens."
      />

      {events.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucune activité pour l'instant"
          description="Les actions importantes (relances, paiements, baux, documents...) apparaîtront ici au fur et à mesure."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={events}
          rowKey={(row) => row.id}
          emptyMessage="Aucune activité."
        />
      )}
    </div>
  );
}
