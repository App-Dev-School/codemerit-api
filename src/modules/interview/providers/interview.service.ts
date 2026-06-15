import {
  Injectable,
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
import { UserService } from 'src/core/users/providers/user.service';
import { CreateInterviewDto } from '../dtos/create-interview.dto';
import { UpdateInterviewDto } from '../dtos/update-interview.dto';
import { SubmitInterviewDto } from '../dtos/submit-interview.dto';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import * as crypto from 'crypto';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(JobRole)
    private readonly jobRoleRepo: Repository<JobRole>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createInterview(dto: CreateInterviewDto) {
    const jobRole = await this.jobRoleRepo.findOne({
      where: { id: dto.jobRoleId },
    });

    if (!jobRole) {
      throw new NotFoundException('Invalid Job Role');
    }

    // Prevent scheduling interviews in the past
    const scheduledAt = new Date(dto.scheduledAt);

    if (scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Interview must be scheduled for a future date and time',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      let userId: number;

      if (dto.userId) {
        const user = await this.userService.findOne(dto.userId);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        userId = user.id;
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
      }

      let interviewCode = '';
      let attempts = 0;

      while (attempts < 5) {
        const generatedCode = crypto
          .randomBytes(5)
          .toString('hex')
          .toUpperCase();

        const existingInterview = await manager.findOne(Interview, {
          where: {
            interviewCode: generatedCode,
          },
        });

        if (!existingInterview) {
          interviewCode = generatedCode;
          break;
        }

        attempts++;
      }

      if (!interviewCode) {
        throw new ConflictException(
          'Failed to generate a unique interview code',
        );
      }

      const interview = manager.create(Interview, {
        title: dto.title,
        jobRoleId: dto.jobRoleId,
        scheduledAt,
        status: InterviewStatusEnum.SCHEDULED,
        interviewCode,
        userId,
      });

      const savedInterview = await manager.save(Interview, interview);

      const historyLog = manager.create(InterviewStatusHistory, {
        interviewId: savedInterview.id,
        oldStatus: savedInterview.status,
        newStatus: savedInterview.status,
        changedBy: userId,
        remarks: 'Interview scheduled successfully.',
      });

      await manager.save(InterviewStatusHistory, historyLog);

      return savedInterview;
    });
  }
  async updateInterview(id: number, dto: UpdateInterviewDto) {
    return await this.dataSource.transaction(async (manager) => {
      const interview = await manager.findOne(Interview, {
        where: { id },
      });

      if (!interview) {
        throw new NotFoundException('Interview not found');
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

      return await manager.save(Interview, interview);
    });
  }
  async submitInterview(dto: SubmitInterviewDto) {
    const interview = await this.interviewRepo.findOne({
      where: { id: dto.interviewId },
    });

    if (!interview) {
      throw new NotFoundException(
        `Interview with ID ${dto.interviewId} not found`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Session creation
      const assessmentSession = new AssessmentSession();
      assessmentSession.userId = interview.userId;
      assessmentSession.interviewId = interview.id;
      const savedAssessment = await manager.save(
        AssessmentSession,
        assessmentSession,
      );

      // Ratings mapping
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
      // Interview update
      interview.status = dto.status;
      interview.feedback = dto.feedback;

      if (dto.status === InterviewStatusEnum.COMPLETED) {
        interview.completedAt = new Date();
      }
      if (dto.status === InterviewStatusEnum.DECLINED) {
        interview.declineReason = dto.declineReason;
      }

      const updatedInterview = await manager.save(Interview, interview);

      // Status log creation
      const historyLog = new InterviewStatusHistory();
      historyLog.interviewId = interview.id;
      historyLog.oldStatus = previousStatus;
      historyLog.newStatus = dto.status;
      historyLog.changedBy = interview.userId;
      historyLog.remarks = 'Interview submitted successfully.';
      await manager.save(InterviewStatusHistory, historyLog);

      return {
        interview: updatedInterview,
        assessmentSession: savedAssessment,
      };
    });
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
      .leftJoinAndSelect('interview.jobRole', 'jobRole')
      .leftJoinAndSelect('interview.assessmentSessions', 'assessmentSessions')
      .orderBy('interview.createdAt', 'DESC');

    if (!fetchAll && userId) {
      query.where('interview.userId = :userId', {
        userId,
      });
    }

    return await query.getMany();
  }
}
