"use server";

import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { getEmailProvider } from "@/lib/notifications/resend-provider";
import { logActivity } from "@/features/activity/log";
import { getTemplate } from "./queries";
import { buildLeaseTemplateVariables } from "./lease-variables";
import { GeneratedDocument } from "./generated-document";
import { renderTemplate } from "@/lib/templates";

const GENERIC_ERROR = "Impossible d'envoyer le document. Réessayez.";

/**
 * Génère un document depuis un modèle et un bail, puis l'envoie par email
 * au locataire (aucune saisie manuelle : son adresse email vient de sa fiche).
 */
export async function sendLeaseDocumentEmail(templateId: string, leaseId: string): Promise<void> {
  const supabase = await createClient();

  const [template, variables, { data: lease }] = await Promise.all([
    getTemplate(templateId),
    buildLeaseTemplateVariables(leaseId),
    supabase
      .from("leases")
      .select("tenants(first_name, last_name, email), properties(name)")
      .eq("id", leaseId)
      .maybeSingle(),
  ]);

  if (!template || !variables || !lease?.tenants || !lease.properties) {
    throw new Error(GENERIC_ERROR);
  }
  if (!lease.tenants.email) {
    throw new Error("Ce locataire n'a pas d'adresse email enregistrée.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerProfile } = user
    ? await supabase.from("owner_profiles").select("full_name").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const content = renderTemplate(template.content, variables);
  const buffer = await renderToBuffer(<GeneratedDocument title={template.name} content={content} />);

  const tenantFullName = `${lease.tenants.first_name} ${lease.tenants.last_name}`;
  const fileName = `${template.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "document"}.pdf`;

  const provider = getEmailProvider();
  const result = await provider.sendEmail({
    to: lease.tenants.email,
    subject: `${template.name} — ${lease.properties.name}`,
    html: `<p>Bonjour ${tenantFullName},</p><p>Veuillez trouver ci-joint votre document « ${template.name} » pour ${lease.properties.name}.</p><p>Cordialement,<br/>${ownerProfile?.full_name ?? ""}</p>`,
    attachments: [{ filename: fileName, content: buffer.toString("base64") }],
  });

  if (!result.success) {
    throw new Error(result.error ?? GENERIC_ERROR);
  }

  const storagePath = `${user!.id}/lease/${leaseId}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: "application/pdf" });

  if (!uploadError) {
    await supabase.from("documents").insert({
      entity_type: "lease",
      entity_id: leaseId,
      document_type: template.category === "bail" ? "bail" : "autres",
      file_name: fileName,
      storage_path: storagePath,
      size_bytes: buffer.length,
    });
  }

  await logActivity({
    action: "document_added",
    entityLabel: `${fileName} envoyé par email à ${tenantFullName} (modèle « ${template.name} »)`,
  });
}
