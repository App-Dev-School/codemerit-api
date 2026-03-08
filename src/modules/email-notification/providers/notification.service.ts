import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailNotification } from 'src/common/typeorm/entities/email-notification.entity';
import { CreateEmailNotificationDto } from '../dtos/create-email-notification.dto';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly notificationRepo: Repository<EmailNotification>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateEmailNotificationDto): Promise<EmailNotification> {
    const notification = this.notificationRepo.create({
      userId: dto.userId,
      title: dto.title ?? '',
      message: dto.message ?? '',
      dataId: dto.dataId ?? 0,
      dataTitle: dto.dataTitle ?? '',
      isRead: false,
      notifyEmail: dto.notifyEmail ?? false,
      notifySMS: dto.notifySMS ?? false,
    });

    const saved = await this.notificationRepo.save(notification);

    if (saved.notifyEmail) {
      await this.emailService.sendNotificationEmail(saved);
    }

    return saved;
  }

  async findByUserId(userId = 0, limit = 50): Promise<EmailNotification[]> {
    if (userId > 0) {
      return this.notificationRepo.find({
        where: { userId },
        take: limit,
        order: { id: 'DESC' },
      });
    }

    return this.notificationRepo.find({
      take: limit,
      order: { id: 'DESC' },
    });
  }
}
