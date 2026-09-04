export type EmailAttachment = {
  filename: string;
  /** Contenu encodé en base64. */
  content: string;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export type SendEmailResult = { success: boolean; error?: string };

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}
