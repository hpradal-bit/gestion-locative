import Link from "next/link";
import { ChevronRight, User } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/parametres/proprietaire",
    icon: User,
    title: "Profil propriétaire",
    description: "Vos coordonnées, utilisées sur les documents générés (quittances).",
  },
];

export default function ParametresPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Paramètres"
        description="Profil, propriétaire, préférences et configuration."
      />
      <div className="flex flex-col gap-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{section.title}</p>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
