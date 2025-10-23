import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppNotificationService } from './providers/notification.service';
import { AppNotification } from 'src/common/typeorm/entities/app-notification.entity';
import { AppNotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppNotification])],
  providers: [AppNotificationService],
  controllers: [AppNotificationController],
  exports: [AppNotificationService],
})
export class AppNotificationModule { }
