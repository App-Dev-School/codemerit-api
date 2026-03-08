import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotification } from 'src/common/typeorm/entities/email-notification.entity';
import { EmailNotificationController } from './email-notification.controller';
import { EmailService } from './providers/email.service';
import { NotificationService } from './providers/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailNotification])],
  controllers: [EmailNotificationController],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class EmailNotificationModule {}
