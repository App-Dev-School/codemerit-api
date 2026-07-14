import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';
import {
  accountVerifiedTemplate,
  badgeEarnedTemplate,
  certificateIssuedTemplate,
  levelUpTemplate,
  otpTemplate,
  passwordChangedTemplate,
  registrationWelcomeTemplate,
  roleEnrolledTemplate,
  streakMilestoneTemplate,
  EmailTemplate,
} from '../templates/mail-templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('mail.resendApiKey'));
    const fromName = this.configService.get<string>('mail.fromName');
    const fromEmail = this.configService.get<string>('mail.fromEmail');
    this.fromAddress = `${fromName} <${fromEmail}>`;
    this.frontendUrl = this.configService.get<string>('mail.frontendUrl');
  }

  private async dispatch(to: string, template: EmailTemplate): Promise<void> {
    const html = template.html.replace(/\{\{FRONTEND_URL\}\}/g, this.frontendUrl);
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject: template.subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Email send failed (${template.subject}) => ${to}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async sendRegistrationWelcomeEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<void> {
    await this.dispatch(to, registrationWelcomeTemplate(name, otp));
  }

  async sendOtpEmail(
    to: string,
    name: string,
    otp: string,
    tag: UserOtpTagsEnum,
  ): Promise<void> {
    await this.dispatch(to, otpTemplate(name, otp, tag));
  }

  async sendAccountVerifiedEmail(to: string, name: string): Promise<void> {
    await this.dispatch(to, accountVerifiedTemplate(name));
  }

  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    await this.dispatch(to, passwordChangedTemplate(name));
  }

  async sendRoleEnrolledEmail(
    to: string,
    name: string,
    jobRoleTitle: string,
  ): Promise<void> {
    await this.dispatch(to, roleEnrolledTemplate(name, jobRoleTitle));
  }

  async sendCertificateIssuedEmail(
    to: string,
    name: string,
    trackTitle: string,
    certificateNumber: string,
  ): Promise<void> {
    await this.dispatch(
      to,
      certificateIssuedTemplate(name, trackTitle, certificateNumber),
    );
  }

  async sendBadgeEarnedEmail(
    to: string,
    name: string,
    badgeName: string,
  ): Promise<void> {
    await this.dispatch(to, badgeEarnedTemplate(name, badgeName));
  }

  async sendStreakMilestoneEmail(
    to: string,
    name: string,
    days: number,
  ): Promise<void> {
    await this.dispatch(to, streakMilestoneTemplate(name, days));
  }

  async sendLevelUpEmail(
    to: string,
    name: string,
    level: number,
    levelTitle: string,
  ): Promise<void> {
    await this.dispatch(to, levelUpTemplate(name, level, levelTitle));
  }
}
