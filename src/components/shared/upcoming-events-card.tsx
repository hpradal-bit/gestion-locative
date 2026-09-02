import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingEvent } from "@/features/dashboard/types";

export function UpcomingEventsCard({ events }: { events: UpcomingEvent[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Échéances</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Rien à signaler pour l&apos;instant.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-sm">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">{event.sublabel}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
