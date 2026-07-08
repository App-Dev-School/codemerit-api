import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {}

  // async sendUserWelcome(user: User): Promise<void> {
  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     // override default from
  //     from: '"Onbaording Team" <support@nestjs-blog.com>',
  //     subject: 'Welcome to NestJs Blog',
  //     // `.ejs` extension is appended automatically to template
  //     template: './welcome',
  //     // Context is available in email template
  //     context: {
  //       name: user.firstName,
  //       email: user.email,
  //       loginUrl: 'http://localhost:3000',
  //     },
  //   });
  // }

  //  private readonly resend = new Resend(
  //   process.env.RESEND_API_KEY,
  // );
  private readonly resend = new Resend('re_XxFNnnj1_3qY1WaduK79NeSchiEvBeENq');

  async sendWelcomeEmail(email: string, name: string) {
    return this.resend.emails.send({
      from: 'Skill Assessment <noreply@codemerit.in>',
      to: email,
      subject: 'Welcome',
      html: `
          <h1>Welcome ${name}</h1>
          <p>Your account has been created.</p>
        `,
    });
  }

  /**************remove all below  */
  //Method should send e-mail from a template
  async sendMail(to: string, subject: string, content: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Skill Assessment <noreply@codemerit.in>',
        to,
        subject,
        html: content,
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to send email to ${to}`, error.stack);
      } else {
        this.logger.error(`Failed to send email to ${to}`, String(error));
      }
      throw error;
    }
  }
}
