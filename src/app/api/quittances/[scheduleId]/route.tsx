import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getReceiptData } from "@/features/receipts/queries";
import { ReceiptDocument } from "@/features/receipts/receipt-document";
import { logActivity } from "@/features/activity/log";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/quittances/[scheduleId]">
) {
  const { scheduleId } = await params;
  const data = await getReceiptData(scheduleId);

  if (!data) {
    return NextResponse.json(
      { error: "Quittance indisponible pour cette échéance." },
      { status: 404 }
    );
  }

  const buffer = await renderToBuffer(<ReceiptDocument data={data} />);

  const periodLabel = new Date(data.period.dueDate).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  await logActivity({
    action: "receipt_generated",
    entityLabel: `${data.tenant.fullName} — ${data.property.name} — ${periodLabel}`,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="quittance.pdf"',
    },
  });
}
