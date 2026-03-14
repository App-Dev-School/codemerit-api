import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/common/typeorm/entities/notification.entity';
import { NotificationController } from './notification.controller';
import { EmailService } from './providers/email.service';
import { NotificationService } from './providers/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class NotificationModule {}
