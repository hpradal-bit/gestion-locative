export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = { success: boolean; error?: string };

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}
