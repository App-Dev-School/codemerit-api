import { registerAs } from '@nestjs/config';

export interface IMailConfig {
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
  frontendUrl: string;
}

export const mailConfig = registerAs('mail', (): IMailConfig => {
  const config: IMailConfig = {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@appdevops.in',
    fromName: process.env.MAIL_FROM_NAME || 'CodeMerit',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  };
  return config;
});
