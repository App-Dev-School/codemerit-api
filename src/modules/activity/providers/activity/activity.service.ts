import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Activity } from 'src/common/typeorm/entities/activity.entity';
import { MailService } from 'src/common/mail/providers/mail.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly mailService: MailService,
  ) {}

  async createActivity(
    userId: number,
    title: string,
    message: string,
    email: string,
    dataId?: number,
    dataType?: string,
  ): Promise<Activity> {
    try {
      const activity = this.activityRepository.create({
        userId,
        title,
        message,
        dataId,
        dataType,
      });

      const savedActivity = await this.activityRepository.save(activity);

      try {
        await this.mailService.sendMail(email, title, `<p>${message}</p>`);
      } catch (mailError) {
        this.logger.error(
          `Activity logged but email failed to send to ${email}`,
          mailError instanceof Error ? mailError.stack : String(mailError),
        );
      }

      this.logger.log(`Activity created successfully for userId=${userId}`);

      return savedActivity;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create activity for userId=${userId}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to create activity for userId=${userId}`,
          String(error),
        );
      }

      throw error;
    }
  }
}
