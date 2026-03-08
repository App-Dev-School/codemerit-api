import { Injectable, Logger } from '@nestjs/common';
import { EmailNotification } from 'src/common/typeorm/entities/email-notification.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendNotificationEmail(notification: EmailNotification): Promise<void> {
    this.logger.log(
      `Email notification queued for userId=${notification.userId}, title=${notification.title}`,
    );
  }
}
