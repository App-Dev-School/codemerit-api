import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Interview } from 'src/common/typeorm/entities/interview.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { InterviewStatusHistory } from 'src/common/typeorm/entities/interview-status-history.entity';
import { InterviewStatusEnum } from 'src/common/enum/interview-status.enum';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { UserService } from 'src/core/users/providers/user.service';
import { CreateInterviewDto } from '../dtos/create-interview.dto';
import { UpdateInterviewDto } from '../dtos/update-interview.dto';
import { SubmitInterviewDto } from '../dtos/submit-interview.dto';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import { ActivityService } from 'src/modules/activity/providers/activity/activity.service';
import * as crypto from 'crypto';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(JobRole)
    private readonly jobRoleRepo: Repository<JobRole>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly activityService: ActivityService,
  ) {}

  async createInterview(dto: CreateInterviewDto) {
    const jobRole = await this.jobRoleRepo.findOne({
      where: { id: dto.jobRoleId },
    });

    if (!jobRole) {
      throw new NotFoundException('Invalid Job Role');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Interview must be scheduled for a future date and time',
      );
    }

    let interviewCode = '';
    let attempts = 0;
    while (attempts < 5) {
      const generatedCode = crypto.randomBytes(5).toString('hex').toUpperCase();
      const existingInterview = await this.interviewRepo.findOne({
        where: { interviewCode: generatedCode },
      });

      if (!existingInterview) {
        interviewCode = generatedCode;
        break;
      }
      attempts++;
    }

    if (!interviewCode) {
      throw new ConflictException('Failed to generate a unique interview code');
    }

    let targetEmail = '';

    const savedInterview = await this.dataSource.transaction(
      async (manager) => {
        let userId: number;

        if (dto.userId) {
          const user = await this.userService.findOne(dto.userId);
          if (!user) {
            throw new NotFoundException('User not found');
          }
          userId = user.id;
          targetEmail = user.email;
        } else {
          if (!dto.email || !dto.firstName) {
            throw new BadRequestException(
              'First name and email are required for new registrations',
            );
          }

          const newUser = await this.userService.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            mobile: dto.mobile,
          });

          userId = newUser.id;
          targetEmail = newUser.email;
        }

        const interview = manager.create(Interview, {
          title: dto.title,
          jobRoleId: dto.jobRoleId,
          scheduledAt,
          status: InterviewStatusEnum.SCHEDULED,
          interviewCode,
          userId,
        });

        const dbSavedInterview = await manager.save(Interview, interview);

        const historyLog = manager.create(InterviewStatusHistory, {
          interviewId: dbSavedInterview.id,
          oldStatus: dbSavedInterview.status,
          newStatus: dbSavedInterview.status,
          changedBy: userId,
          remarks: 'Interview scheduled successfully.',
        });

        await manager.save(InterviewStatusHistory, historyLog);

        return dbSavedInterview;
      },
    );

    try {
      await this.activityService.createActivity(
        savedInterview.userId,
        'Interview Scheduled',
        `Your interview "${savedInterview.title}" has been scheduled for ${savedInterview.scheduledAt.toLocaleString()}.`,
        savedInterview.id,
        'INTERVIEW',
      );
    } catch (activityError) {
      this.logger.error(
        'Failed to create interview activity / send email',
        activityError instanceof Error
          ? activityError.stack
          : String(activityError),
      );
    }

    return savedInterview;
  }

  async updateInterview(interviewId: number, dto: UpdateInterviewDto) {
    const interview = await this.interviewRepo.findOne({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const currentStatus = interview.status.toString().toUpperCase();
    if (currentStatus === 'COMPLETED' || currentStatus === 'DECLINED') {
      throw new BadRequestException(
        `Cannot modify interview details because it is already ${interview.status.toLowerCase()}.`,
      );
    }

    if (dto.title !== undefined) {
      interview.title = dto.title;
    }

    if (dto.jobRoleId !== undefined) {
      const jobRole = await this.jobRoleRepo.findOne({
        where: { id: dto.jobRoleId },
      });

      if (!jobRole) {
        throw new NotFoundException('Invalid Job Role');
      }

      interview.jobRoleId = dto.jobRoleId;
    }

    if (dto.scheduledAt !== undefined) {
      const scheduledAt = new Date(dto.scheduledAt);

      if (scheduledAt <= new Date()) {
        throw new BadRequestException(
          'Interview must be scheduled for a future date and time',
        );
      }

      interview.scheduledAt = scheduledAt;
    }

    if (dto.externalId !== undefined) {
      interview.externalId = dto.externalId;
    }

    return await this.interviewRepo.save(interview);
  }

  async submitInterview(dto: SubmitInterviewDto, currentUserId: number) {
    if (
      !dto.skillRatings ||
      !Array.isArray(dto.skillRatings) ||
      dto.skillRatings.length === 0
    ) {
      throw new BadRequestException(
        'Interview submission must contain at least one skill rating.',
      );
    }

    if (
      dto.status === InterviewStatusEnum.DECLINED &&
      !dto.declineReason?.trim()
    ) {
      throw new BadRequestException(
        'A clear decline reason must be specified when rejecting an interview.',
      );
    }

    const interview = await this.interviewRepo.findOne({
      where: { id: dto.interviewId },
    });

    if (!interview) {
      throw new NotFoundException(
        `Interview with ID ${dto.interviewId} not found`,
      );
    }

    const user = await this.userService.findOne(interview.userId);
    if (!user) {
      throw new NotFoundException(
        'User associated with this interview not found',
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const assessmentSession = new AssessmentSession();
      assessmentSession.userId = interview.userId;
      assessmentSession.interviewId = interview.id;
      assessmentSession.ratedBy = currentUserId;
      assessmentSession.ratingType = RatingTypeEnum.INTERVIEW;
      assessmentSession.assessmentTitle = interview.title;

      const savedAssessment = await manager.save(
        AssessmentSession,
        assessmentSession,
      );

      const skillRatingsData = dto.skillRatings.map((item) => {
        const rating = new SkillRating();
        rating.skillId = item.skillId;
        rating.skillType = item.skillType;
        rating.rating = item.rating;
        rating.assessmentSessionId = savedAssessment.id;
        return rating;
      });
      await manager.save(SkillRating, skillRatingsData);

      const previousStatus = interview.status;
      interview.status = dto.status;

      if (dto.status === InterviewStatusEnum.COMPLETED) {
        interview.feedback = dto.feedback ?? null;
        interview.completedAt = new Date();
        interview.declineReason = null;
      }
      if (dto.status === InterviewStatusEnum.DECLINED) {
        interview.feedback = dto.feedback ?? null;
        interview.declineReason = dto.declineReason;
        interview.completedAt = null;
      }

      const updatedInterview = await manager.save(Interview, interview);

      const historyLog = new InterviewStatusHistory();
      historyLog.interviewId = interview.id;
      historyLog.oldStatus = previousStatus;
      historyLog.newStatus = dto.status;
      historyLog.changedBy = currentUserId;
      historyLog.remarks = 'Interview submitted successfully.';
      await manager.save(InterviewStatusHistory, historyLog);

      return {
        interview: updatedInterview,
        assessmentSession: savedAssessment,
      };
    });

    try {
      const isCompleted =
        result.interview.status === InterviewStatusEnum.COMPLETED;
      const activityTitle = isCompleted
        ? 'Interview Completed'
        : 'Interview Declined';
      const activityMessage = isCompleted
        ? `Your interview "${result.interview.title}" has been successfully completed and reviewed.`
        : `Your interview "${result.interview.title}" was marked as declined. Reason: ${result.interview.declineReason}`;

      await this.activityService.createActivity(
        result.interview.userId,
        activityTitle,
        activityMessage,
        result.interview.id,
        'INTERVIEW',
      );
    } catch (activityError) {
      this.logger.error(
        'Failed to create interview submission activity / send email',
        activityError instanceof Error
          ? activityError.stack
          : String(activityError),
      );
    }

    return result;
  }

  async getInterviewDetails(interviewCode: string) {
    const interview = await this.interviewRepo
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.user', 'user')
      .leftJoinAndSelect('interview.jobRole', 'jobRole')
      .leftJoinAndSelect('interview.assessmentSessions', 'assessmentSession')
      .leftJoinAndSelect('assessmentSession.skillRatings', 'skillRating')
      .leftJoinAndSelect('interview.statusHistory', 'statusHistory')
      .where('interview.interviewCode = :interviewCode', {
        interviewCode,
      })
      .orderBy('assessmentSession.createdAt', 'DESC')
      .addOrderBy('statusHistory.createdAt', 'DESC')
      .getOne();

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async getInterviews(userId?: number, fetchAll?: boolean) {
    const query = this.interviewRepo
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.user', 'user')
      .leftJoinAndSelect('interview.jobRole', 'jobRole');

    if (!fetchAll && userId) {
      query.where('interview.userId = :userId', { userId });
    }

    return await query.getMany();
  }
}
