import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getReceiptData } from "@/features/receipts/queries";
import { ReceiptDocument } from "@/features/receipts/receipt-document";

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

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="quittance.pdf"',
    },
  });
}
