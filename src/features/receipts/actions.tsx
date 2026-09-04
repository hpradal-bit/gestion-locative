"use server";

import { renderToBuffer } from "@react-pdf/renderer";

import { getEmailProvider } from "@/lib/notifications/resend-provider";
import { logActivity } from "@/features/activity/log";
import { getReceiptData } from "./queries";
import { ReceiptDocument } from "./receipt-document";

const GENERIC_ERROR = "Impossible d'envoyer la quittance. Réessayez.";

/**
 * Envoie la quittance d'une échéance payée par email, sans aucune saisie
 * manuelle : le nom et l'adresse email du locataire viennent tous les deux
 * de sa fiche, la quittance est générée à la volée et jointe en PDF.
 */
export async function sendReceiptEmail(scheduleId: string): Promise<void> {
  const data = await getReceiptData(scheduleId);
  if (!data) {
    throw new Error("Cette échéance n'est pas encore intégralement payée : pas de quittance à envoyer.");
  }
  if (!data.tenant.email) {
    throw new Error("Ce locataire n'a pas d'adresse email enregistrée.");
  }

  const periodLabel = new Date(data.period.dueDate).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const buffer = await renderToBuffer(<ReceiptDocument data={data} />);

  const provider = getEmailProvider();
  const result = await provider.sendEmail({
    to: data.tenant.email,
    subject: `Quittance de loyer — ${data.property.name} — ${periodLabel}`,
    html: `<p>Bonjour ${data.tenant.fullName},</p><p>Veuillez trouver ci-joint votre quittance de loyer pour ${data.property.name}, période de ${periodLabel}.</p><p>Cordialement,<br/>${data.owner.fullName}</p>`,
    attachments: [
      {
        filename: `quittance-${periodLabel.replace(/\s+/g, "-")}.pdf`,
        content: buffer.toString("base64"),
      },
    ],
  });

  if (!result.success) {
    throw new Error(result.error ?? GENERIC_ERROR);
  }

  await logActivity({
    action: "receipt_generated",
    entityLabel: `Quittance envoyée — ${data.tenant.fullName} — ${data.property.name} — ${periodLabel}`,
  });
}
