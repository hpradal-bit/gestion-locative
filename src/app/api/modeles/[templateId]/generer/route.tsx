import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { getTemplate } from "@/features/templates/queries";
import { buildLeaseTemplateVariables } from "@/features/templates/lease-variables";
import { GeneratedDocument } from "@/features/templates/generated-document";
import { renderTemplate } from "@/lib/templates";
import { logActivity } from "@/features/activity/log";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/modeles/[templateId]/generer">
) {
  const { templateId } = await params;
  const { searchParams } = new URL(request.url);
  const leaseId = searchParams.get("leaseId");

  if (!leaseId) {
    return NextResponse.json({ error: "Bail non spécifié." }, { status: 400 });
  }

  const [template, variables] = await Promise.all([
    getTemplate(templateId),
    buildLeaseTemplateVariables(leaseId),
  ]);

  if (!template || !variables) {
    return NextResponse.json({ error: "Modèle ou bail introuvable." }, { status: 404 });
  }

  const content = renderTemplate(template.content, variables);
  const buffer = await renderToBuffer(<GeneratedDocument title={template.name} content={content} />);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const fileName = `${template.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "document"}.pdf`;
    const storagePath = `${user.id}/lease/${leaseId}/${Date.now()}-${fileName}`;
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
      await logActivity({
        action: "document_added",
        entityLabel: `${fileName} (généré depuis le modèle « ${template.name} »)`,
      });
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${template.name}.pdf"`,
    },
  });
}
