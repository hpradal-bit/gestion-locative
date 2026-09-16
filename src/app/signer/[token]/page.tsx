import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";

import { getSignatureRequestByToken } from "@/features/signatures/queries";
import { DocumentWebView } from "@/features/signatures/document-web-view";
import {
  SignatureBox,
  SignedSignatureBox,
  PendingSignatureBox,
} from "@/features/signatures/signature-box";

export default async function SignerPage({ params }: PageProps<"/signer/[token]">) {
  const { token } = await params;
  const found = await getSignatureRequestByToken(token);

  if (!found) {
    notFound();
  }

  const { request, role } = found;
  const bothSigned = Boolean(request.owner_signed_at && request.tenant_signed_at);

  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto mb-6 flex max-w-2xl flex-col items-center gap-1 px-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Signature électronique
        </p>
        <h1 className="text-lg font-semibold text-[#1c2b45]">{request.document_name}</h1>
        {bothSigned && (
          <p className="mt-2 flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CircleCheck className="size-3.5" />
            Document signé par les deux parties
          </p>
        )}
      </div>

      <div className="px-4">
        <DocumentWebView
          title={request.document_name}
          content={request.content}
          renderSignatureSlot={(label) => {
            const isOwnerSlot = /bailleur/i.test(label);
            const signedName = isOwnerSlot ? request.owner_signed_name : request.tenant_signed_name;
            const signedAt = isOwnerSlot ? request.owner_signed_at : request.tenant_signed_at;
            const slotToken = isOwnerSlot ? request.owner_token : request.tenant_token;
            const isViewerSlot = isOwnerSlot ? role === "owner" : role === "tenant";

            if (signedName && signedAt) {
              return <SignedSignatureBox label={label} name={signedName} signedAt={signedAt} />;
            }
            if (isViewerSlot) {
              return <SignatureBox token={slotToken} label={label} />;
            }
            return <PendingSignatureBox label={label} />;
          }}
        />
      </div>
    </main>
  );
}
