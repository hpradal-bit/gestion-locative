import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { OwnerProfileForm } from "@/features/settings/owner-profile-form";
import { getOwnerProfile } from "@/features/settings/queries";

export const metadata: Metadata = { title: "Profil propriétaire" };

export default async function ProprietairePage() {
  const profile = await getOwnerProfile();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Profil propriétaire"
        description="Vos coordonnées, utilisées sur les documents générés."
      />
      <OwnerProfileForm profile={profile} />
    </div>
  );
}
