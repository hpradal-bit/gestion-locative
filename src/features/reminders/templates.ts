import { formatCurrency } from "@/lib/format";

export const reminderLevels = [1, 2, 3] as const;
export type ReminderLevel = (typeof reminderLevels)[number];

export type ReminderContext = {
  tenantName: string;
  propertyName: string;
  amount: number;
  dueDate: string;
};

function formatDateFR(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Trois niveaux de relance, du plus cordial au plus formel. Les textes vivent
 * ici (jamais dans les composants) pour rester la seule source du contenu
 * envoyé, quel que soit l'endroit d'où la relance est déclenchée.
 */
export function buildReminderMessage(
  level: ReminderLevel,
  context: ReminderContext
): { subject: string; body: string } {
  const amount = formatCurrency(context.amount);
  const date = formatDateFR(context.dueDate);

  if (level === 1) {
    return {
      subject: `Petit rappel — loyer ${context.propertyName}`,
      body: `Bonjour ${context.tenantName},\n\nJe me permets de vous rappeler que le loyer de ${amount} dû le ${date} pour le logement ${context.propertyName} n'a pas encore été réglé. Il s'agit peut-être d'un simple oubli.\n\nN'hésitez pas à me contacter si besoin.\n\nCordialement.`,
    };
  }

  if (level === 2) {
    return {
      subject: `Relance — loyer impayé ${context.propertyName}`,
      body: `Bonjour ${context.tenantName},\n\nSauf erreur de ma part, le loyer de ${amount} dû le ${date} pour le logement ${context.propertyName} reste impayé à ce jour, malgré un premier rappel.\n\nMerci de bien vouloir régulariser cette situation dans les meilleurs délais.\n\nCordialement.`,
    };
  }

  return {
    subject: `Mise en demeure — loyer impayé ${context.propertyName}`,
    body: `Madame, Monsieur ${context.tenantName},\n\nMalgré nos précédentes relances, le loyer de ${amount} dû le ${date} pour le logement ${context.propertyName} demeure impayé.\n\nNous vous mettons en demeure de régulariser cette situation sous 8 jours à compter de la réception de ce courrier, faute de quoi nous nous réservons le droit d'engager les démarches nécessaires au recouvrement de cette créance.\n\nVeuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  };
}
