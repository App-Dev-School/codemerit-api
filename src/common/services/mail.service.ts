import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService
  ) {}

  //Method should send e-mail from a template
  async sendMail(to: string, content: string) {
    Logger.log("##AuthStep6: SendEmail => " + JSON.stringify(to));
    try {
    //   return this.mailerService.sendMail({
    //     to,
    //     subject: "SkillTest Nest JS AppDev",
    //     template: __dirname + '/templates/student-verification',
    //     context: {
    //         content,
    //     }
    //   });
    const mailSent = this.mailerService.sendMail({
        from: 'Vishal <javacheartofmine@gmail.com>',
        to: 'digitechgeeksolutions@gmail.com',
        subject: `SkillTest Nest JS AppDev`,
        text: content,
      });
      Logger.log("##AuthStep6: SendEmail Success => " + JSON.stringify(mailSent));
    } catch (e) {
      Logger.log("##AuthStep6: SendEmail Failed => " + JSON.stringify(e));
      this.logger.error("FromLocal Logger => "+e);
      throw e;
    }
  }
}