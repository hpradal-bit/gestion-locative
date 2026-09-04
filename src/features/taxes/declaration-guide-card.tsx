import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeclarationGuide } from "./declaration-guide";

export function DeclarationGuideCard({ guide }: { guide: DeclarationGuide }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{guide.title}</CardTitle>
        <CardDescription>Formulaires : {guide.forms.join(" puis ")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <p className="mb-1 font-medium">Cases à remplir</p>
          <ul className="flex flex-col gap-1.5">
            {guide.boxes.map((box) => (
              <li key={box.box}>
                <span className="font-medium">Case {box.box}</span> — {box.description}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1 font-medium">Si le bien génère un bénéfice</p>
          <p className="text-muted-foreground">{guide.whenProfit}</p>
        </div>

        {guide.whenDeficit && (
          <div>
            <p className="mb-1 font-medium">Si le bien génère un déficit</p>
            <p className="text-muted-foreground">{guide.whenDeficit}</p>
          </div>
        )}

        {guide.carryForward && (
          <div>
            <p className="mb-1 font-medium">Comment fonctionne le report</p>
            <p className="text-muted-foreground">{guide.carryForward}</p>
          </div>
        )}

        {guide.notes.length > 0 && (
          <div>
            <p className="mb-1 font-medium">À savoir</p>
            <ul className="list-disc pl-4 text-muted-foreground">
              {guide.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
