import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/common/typeorm/entities/notification.entity';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { EmailService } from './email.service';
import { NOTIFICATION_MESSAGES } from '../constants/notification.constants';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly emailService: EmailService,
  ) {}

  private format(
    template: string,
    params: Record<string, string | number>,
  ): string {
    return template.replace(/\{(\w+)\}/g, (_, key) =>
      params[key] !== undefined ? String(params[key]) : `{${key}}`,
    );
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
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

  async notifyRoleEnrolled(
    userId: number,
    name: string,
    jobRole: string,
    jobRoleId = 0,
  ): Promise<Notification> {
    const entity = this.notificationRepo.create({
      userId,
      title: 'Role Enrolled',
      message: this.format(NOTIFICATION_MESSAGES.ROLE_ENROLLED, {
        name,
        JobRole: jobRole,
      }),
      dataId: jobRoleId,
      dataTitle: jobRole,
      isRead: false,
      notifyEmail: false,
      notifySMS: false,
      createdBy: userId,
    });
    return this.notificationRepo.save(entity);
  }

  async notifyAccountVerified(
    userId: number,
    name: string,
  ): Promise<Notification> {
    const entity = this.notificationRepo.create({
      userId,
      title: 'Account Verified',
      message: this.format(NOTIFICATION_MESSAGES.ACCOUNT_VERIFIED, { name }),
      dataId: 0,
      dataTitle: 'Account Verification',
      isRead: false,
      notifyEmail: false,
      notifySMS: false,
      createdBy: userId,
    });
    return this.notificationRepo.save(entity);
  }

  async notifyQuizCompleted(
    userId: number,
    quizName: string,
    score: number,
    quizId = 0,
  ): Promise<Notification> {
    const entity = this.notificationRepo.create({
      userId,
      title: 'Quiz Completed',
      message: this.format(NOTIFICATION_MESSAGES.QUIZ_COMPLETED, {
        QuizName: quizName,
        score,
      }),
      dataId: quizId,
      dataTitle: quizName,
      isRead: false,
      notifyEmail: false,
      notifySMS: false,
      createdBy: userId,
    });
    return this.notificationRepo.save(entity);
  }

  async findByUserId(userId = 0, limit = 50): Promise<Notification[]> {
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
