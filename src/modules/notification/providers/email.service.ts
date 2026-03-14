import { Injectable, Logger } from '@nestjs/common';
import { Notification } from 'src/common/typeorm/entities/notification.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendNotificationEmail(notification: Notification): Promise<void> {
    this.logger.log(
      `Email notification queued for userId=${notification.userId}, title=${notification.title}`,
    );
  }
}
