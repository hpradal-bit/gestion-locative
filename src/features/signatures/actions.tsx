"use server";

import { headers } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailProvider } from "@/lib/notifications/resend-provider";
import { getTemplate } from "@/features/templates/queries";
import { buildLeaseTemplateVariables } from "@/features/templates/lease-variables";
import { renderTemplate } from "@/lib/templates";
import { GeneratedDocument } from "@/features/templates/generated-document";
import { signerNameSchema } from "./schema";
import type { Tables } from "@/lib/supabase/database.types";

const GENERIC_ERROR = "Impossible d'envoyer le document pour signature. Réessayez.";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export type CreateSignatureRequestResult =
  | { error: string; ownerSignUrl?: undefined }
  | { error: null; ownerSignUrl: string };

/**
 * Envoie un bail pour signature électronique : figeant son contenu actuel,
 * puis un email à chaque partie avec son propre lien de signature. Le
 * propriétaire reçoit aussi son lien directement ici pour signer sans
 * attendre l'email.
 */
export async function createSignatureRequest(
  leaseId: string,
  templateId: string
): Promise<CreateSignatureRequestResult> {
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
    return { error: GENERIC_ERROR };
  }
  if (!lease.tenants.email) {
    return { error: "Ce locataire n'a pas d'adresse email enregistrée." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: GENERIC_ERROR };
  }
  const { data: ownerProfile } = await supabase
    .from("owner_profiles")
    .select("full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownerProfile?.full_name) {
    return { error: "Renseignez vos coordonnées (nom complet) dans Paramètres avant l'envoi." };
  }

  const content = renderTemplate(template.content, variables);
  const tenantFullName = `${lease.tenants.first_name} ${lease.tenants.last_name}`;

  const { data: request, error } = await supabase
    .from("signature_requests")
    .insert({
      lease_id: leaseId,
      template_id: templateId,
      document_name: template.name,
      content,
      owner_name: ownerProfile.full_name,
      tenant_name: tenantFullName,
    })
    .select("owner_token, tenant_token")
    .single();

  if (error || !request) {
    return { error: GENERIC_ERROR };
  }

  const baseUrl = await getBaseUrl();
  const ownerSignUrl = `${baseUrl}/signer/${request.owner_token}`;
  const tenantSignUrl = `${baseUrl}/signer/${request.tenant_token}`;

  const provider = getEmailProvider();
  const tenantEmailResult = await provider.sendEmail({
    to: lease.tenants.email,
    subject: `${template.name} — à signer`,
    html: `<p>Bonjour ${tenantFullName},</p><p>${ownerProfile.full_name} vous invite à signer électroniquement le document « ${template.name} » pour ${lease.properties.name}.</p><p><a href="${tenantSignUrl}">Cliquez ici pour consulter et signer le document</a></p><p>Cordialement,<br/>${ownerProfile.full_name}</p>`,
  });

  if (!tenantEmailResult.success) {
    // La demande existe déjà en base (le lien fonctionne), mais l'email n'est pas parti :
    // on le signale plutôt que de laisser croire que le locataire l'a reçu.
    return {
      error: `${tenantEmailResult.error ?? "Impossible d'envoyer l'email."} Le lien reste valide : ${tenantSignUrl}`,
    };
  }

  if (ownerProfile.email) {
    await provider.sendEmail({
      to: ownerProfile.email,
      subject: `${template.name} — à signer`,
      html: `<p>Bonjour ${ownerProfile.full_name},</p><p>Voici votre lien pour signer électroniquement le document « ${template.name} » pour ${lease.properties.name}.</p><p><a href="${ownerSignUrl}">Cliquez ici pour consulter et signer le document</a></p>`,
    });
  }

  return { error: null, ownerSignUrl };
}

export type SignDocumentResult = { error: string | null; success?: boolean };

const SIGN_GENERIC_ERROR = "Impossible d'enregistrer la signature. Réessayez.";

/**
 * Signe un document via son jeton — accessible sans authentification.
 * Une fois signé, un emplacement de signature n'est plus modifiable : cette
 * action refuse toute nouvelle tentative sur un emplacement déjà signé.
 */
export async function signDocument(
  token: string,
  _prevState: SignDocumentResult,
  formData: FormData
): Promise<SignDocumentResult> {
  const parsed = signerNameSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? SIGN_GENERIC_ERROR };
  }

  const supabase = createAdminClient();

  const [{ data: byOwner }, { data: byTenant }] = await Promise.all([
    supabase.from("signature_requests").select("*").eq("owner_token", token).maybeSingle(),
    supabase.from("signature_requests").select("*").eq("tenant_token", token).maybeSingle(),
  ]);
  const request = byOwner ?? byTenant;
  const role = byOwner ? "owner" : "tenant";

  if (!request) {
    return { error: "Lien de signature invalide." };
  }

  const alreadySigned = role === "owner" ? request.owner_signed_at : request.tenant_signed_at;
  if (alreadySigned) {
    return { error: "Ce document a déjà été signé à cet emplacement." };
  }

  const signedName = `${parsed.data.first_name} ${parsed.data.last_name}`;
  const signedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("signature_requests")
    .update(
      role === "owner"
        ? { owner_signed_name: signedName, owner_signed_at: signedAt }
        : { tenant_signed_name: signedName, tenant_signed_at: signedAt }
    )
    .eq("id", request.id);

  if (updateError) {
    return { error: SIGN_GENERIC_ERROR };
  }

  await supabase.from("activity_events").insert({
    user_id: request.user_id,
    action: "document_signed",
    entity_label: `${request.document_name} signé par ${signedName}`,
  });

  const bothSigned =
    (role === "owner" ? true : Boolean(request.owner_signed_at)) &&
    (role === "tenant" ? true : Boolean(request.tenant_signed_at));

  if (bothSigned) {
    await finalizeSignedDocument(supabase, {
      ...request,
      owner_signed_name: role === "owner" ? signedName : request.owner_signed_name,
      owner_signed_at: role === "owner" ? signedAt : request.owner_signed_at,
      tenant_signed_name: role === "tenant" ? signedName : request.tenant_signed_name,
      tenant_signed_at: role === "tenant" ? signedAt : request.tenant_signed_at,
    });
  }

  return { error: null, success: true };
}

/** Génère le PDF final avec les deux signatures et l'archive dans les documents du bail. */
async function finalizeSignedDocument(
  supabase: ReturnType<typeof createAdminClient>,
  request: Tables<"signature_requests">
): Promise<void> {
  if (
    !request.owner_signed_name ||
    !request.owner_signed_at ||
    !request.tenant_signed_name ||
    !request.tenant_signed_at
  ) {
    return;
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const buffer = await renderToBuffer(
    <GeneratedDocument
      title={request.document_name}
      content={request.content}
      signatures={{
        owner: { name: request.owner_signed_name, signedAt: formatDateTime(request.owner_signed_at) },
        tenant: { name: request.tenant_signed_name, signedAt: formatDateTime(request.tenant_signed_at) },
      }}
    />
  );

  const fileName = `${request.document_name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "document"} - signé.pdf`;
  const storagePath = `${request.user_id}/lease/${request.lease_id}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: "application/pdf" });
  if (uploadError) return;

  const { data: document } = await supabase
    .from("documents")
    .insert({
      user_id: request.user_id,
      entity_type: "lease",
      entity_id: request.lease_id,
      document_type: "bail",
      file_name: fileName,
      storage_path: storagePath,
      size_bytes: buffer.length,
    })
    .select("id")
    .single();

  await supabase
    .from("signature_requests")
    .update({ final_document_id: document?.id ?? null })
    .eq("id", request.id);

  await supabase.from("activity_events").insert({
    user_id: request.user_id,
    action: "document_added",
    entity_label: `${fileName} (signé par les deux parties)`,
  });

  const { data: lease } = await supabase
    .from("leases")
    .select("tenants(email)")
    .eq("id", request.lease_id)
    .maybeSingle();
  const { data: ownerProfile } = await supabase
    .from("owner_profiles")
    .select("email")
    .eq("user_id", request.user_id)
    .maybeSingle();

  const provider = getEmailProvider();
  const recipients = [lease?.tenants?.email, ownerProfile?.email].filter(
    (email): email is string => Boolean(email)
  );
  for (const to of recipients) {
    await provider.sendEmail({
      to,
      subject: `${request.document_name} — signé par les deux parties`,
      html: `<p>Le document « ${request.document_name} » a été signé par ${request.owner_signed_name} et ${request.tenant_signed_name}. Vous le retrouverez dans l'application, dans les documents du bail.</p>`,
      attachments: [{ filename: fileName, content: buffer.toString("base64") }],
    });
  }
}
