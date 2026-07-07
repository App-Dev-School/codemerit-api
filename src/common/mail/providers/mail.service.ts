import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
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
    private readonly resend = new Resend(
      're_XxFNnnj1_3qY1WaduK79NeSchiEvBeENq'
    );
  
    async sendWelcomeEmail(
      email: string,
      name: string,
    ) {
      const emailSent = this.resend.emails.send({
        from: 'Skill Assessment <noreply@appdevops.in>',
        to: email,
        subject: 'Welcome',
        html: `
          <h1>Welcome ${name}</h1>
          <p>Your account has been created.</p>
        `,
      });
      return emailSent
    }
  
    /**************remove all below  */
    //Method should send e-mail from a template
    async sendMail(to: string, subject:string, content: string) {
      console.log("##AuthStep6: SendEmail => " + JSON.stringify(to));
      try {
        return this.resend.emails.send({
        from: ' <noreply@appdevops.in>',
        to: to,
        subject: subject,
        html: '${content}'
      });
        console.log("##AuthStep6: SendEmail Success");
      } catch (e) {
        console.log("##AuthStep6: SendEmail Failed => " + JSON.stringify(e));
        //throw e;
      }
    }
}
