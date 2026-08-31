import type { EmailProvider, SendEmailInput, SendEmailResult } from "./provider";

const GENERIC_ERROR = "Impossible d'envoyer l'email. Réessayez.";

/**
 * Implémentation Resend de EmailProvider. Le reste de l'application ne
 * dépend jamais de Resend directement — seulement de l'interface
 * EmailProvider — pour pouvoir changer de fournisseur sans tout réécrire.
 */
export class ResendEmailProvider implements EmailProvider {
  async sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "L'envoi d'emails n'est pas encore configuré (clé Resend manquante).",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Gestion locative <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        return { success: false, error: GENERIC_ERROR };
      }

      return { success: true };
    } catch {
      return { success: false, error: GENERIC_ERROR };
    }
  }
}

export function getEmailProvider(): EmailProvider {
  return new ResendEmailProvider();
}
