// src/modules/admin/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,

    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,

     @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    @InjectRepository(QuestionAttempt)
    private readonly attemptRepo: Repository<QuestionAttempt>,

    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>
  ) {}

  async getDashboardSummary() {
    const [attempts, questions, users, topics, subjects, quizzes, timeSeries] = await Promise.all([
      this.getAttemptStats(),
      this.getQuestionStats(),
      this.getUserStats(),
      this.getTopicStats(),
      this.getSubjectStats(),
      this.getQuizStats(),
      this.getTimeSeriesStats(),
    ]);

    return {
      error: false,
      message: 'Admin dashboard fetched successfully.',
      data: {
        attempts,
        questions,
        users,
        topics,
        subjects,
        quizzes,
        timeSeries,
      },
    };
  }

  // ------------------- ATTEMPT METRICS -------------------
  private async getAttemptStats() {
    const result = await this.attemptRepo
      .createQueryBuilder('a')
      .select([
        'COUNT(a.id) as total',
        'SUM(CASE WHEN a.isCorrect = true THEN 1 ELSE 0 END) as totalCorrect',
        'SUM(CASE WHEN a.isCorrect = false AND a.isSkipped = false THEN 1 ELSE 0 END) as totalWrong',
        'SUM(CASE WHEN a.isSkipped = true THEN 1 ELSE 0 END) as totalSkipped',
        'COUNT(DISTINCT a.userId) as distinctUsers',
      ])
      .getRawOne();

    return {
      total: +result.total || 0,
      totalCorrect: +result.totalCorrect || 0,
      totalWrong: +result.totalWrong || 0,
      totalSkipped: +result.totalSkipped || 0,
      distinctUsers: +result.distinctUsers || 0,
    };
  }

  // ------------------- QUESTION METRICS -------------------
  private async getQuestionStats() {
    const result = await this.questionRepo
      .createQueryBuilder('q')
      .select([
        'COUNT(q.id) as total',
        `SUM(CASE WHEN q.questionType = :trivia THEN 1 ELSE 0 END) as totalTrivia`,
        `SUM(CASE WHEN q.questionType = :general THEN 1 ELSE 0 END) as totalGeneral`,
        `SUM(CASE WHEN q.questionType = :trivia AND q.status = :active THEN 1 ELSE 0 END) as totalTriviaActive`,
        `SUM(CASE WHEN q.questionType = :general AND q.status = :active THEN 1 ELSE 0 END) as totalGeneralActive`,
        `SUM(CASE WHEN q.questionType = :trivia AND q.status = :pending THEN 1 ELSE 0 END) as totalTriviaPending`,
        `SUM(CASE WHEN q.questionType = :general AND q.status = :pending THEN 1 ELSE 0 END) as totalGeneralPending`,
      ])
      .setParameters({
        trivia: QuestionTypeEnum.Trivia,
        general: QuestionTypeEnum.General,
        active: QuestionStatusEnum.Active,
        pending: QuestionStatusEnum.Pending,
      })
      .getRawOne();

    return {
      total: +result.total || 0,
      totalTrivia: +result.totalTrivia || 0,
      totalGeneral: +result.totalGeneral || 0,
      totalTriviaActive: +result.totalTriviaActive || 0,
      totalGeneralActive: +result.totalGeneralActive || 0,
      totalTriviaPending: +result.totalTriviaPending || 0,
      totalGeneralPending: +result.totalGeneralPending || 0,
    };
  }

  // ------------------- USER METRICS -------------------
  private async getUserStats() {
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select([
        'COUNT(u.id) as total',
        `SUM(CASE WHEN u.accountStatus = :active THEN 1 ELSE 0 END) as totalActive`,
        `SUM(CASE WHEN u.accountStatus = :pending THEN 1 ELSE 0 END) as totalPending`,
        `SUM(CASE WHEN u.accountStatus = :blocked THEN 1 ELSE 0 END) as totalBlocked`,
        `SUM(CASE WHEN u.designation IS NOT NULL AND u.designation > 0 THEN 1 ELSE 0 END) as totalWithDesignation`,
        `SUM(CASE WHEN u.role = :manager THEN 1 ELSE 0 END) as totalWithRoleManager`,
      ])
      .setParameters({
        active: AccountStatusEnum.ACTIVE,
        pending: AccountStatusEnum.PENDING,
        blocked: AccountStatusEnum.BLOCKED,
        manager: UserRoleEnum.MODERATOR,
      })
      .getRawOne();

    return {
      total: +result.total || 0,
      totalActive: +result.totalActive || 0,
      totalPending: +result.totalPending || 0,
      totalBlocked: +result.totalBlocked || 0,
      totalWithDesignation: +result.totalWithDesignation || 0,
      totalWithRoleManager: +result.totalWithRoleManager || 0,
    };
  }

  // ------------------- TOPIC METRICS -------------------
  private async getTopicStats() {
    const result = await this.topicRepo
      .createQueryBuilder('t')
      .select([
        'COUNT(t.id) as total',
        `SUM(CASE WHEN t.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
        `SUM(CASE WHEN t.isPublished = false THEN 1 ELSE 0 END) as totalPending`,
      ])
      .getRawOne();

    return {
      total: +result.total || 0,
      totalActive: +result.totalActive || 0,
      totalPending: +result.totalPending || 0,
    };
  }

  // ------------------- SUBJECT METRICS -------------------
  private async getSubjectStats() {
    const result = await this.subjectRepo
      .createQueryBuilder('s')
      .select([
        'COUNT(s.id) as total',
        `SUM(CASE WHEN s.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
        `SUM(CASE WHEN s.isPublished = false THEN 1 ELSE 0 END) as totalInactive`,
      ])
      .getRawOne();

    return {
      total: +result.total || 0,
      totalActive: +result.totalActive || 0,
      totalInactive: +result.totalInactive || 0,
    };
  }

  // ------------------- QUIZ METRICS -------------------
  private async getQuizStats() {
    const result = await this.quizRepo
      .createQueryBuilder('qz')
      .select([
        'COUNT(qz.id) as total',
        `SUM(CASE WHEN qz.isPublished = true THEN 1 ELSE 0 END) as totalActive`,
        `SUM(CASE WHEN qz.isPublished = false THEN 1 ELSE 0 END) as totalInactive`,
      ])
      .getRawOne();

    return {
      total: +result.total || 0,
      totalActive: +result.totalActive || 0,
      totalInactive: +result.totalInactive || 0,
    };
  }

  // ------------------- TIME SERIES (DAILY) -------------------
  private async getTimeSeriesStats() {
    // Using DATE() function works for both MySQL and PostgreSQL
    const [userSeries, questionSeries] = await Promise.all([
      this.userRepo
        .createQueryBuilder('u')
        .select([
          `DATE(u.createdAt) as date`,
          `COUNT(u.id) as count`,
        ])
        .groupBy('DATE(u.createdAt)')
        .orderBy('DATE(u.createdAt)', 'ASC')
        .limit(30)
        .getRawMany(),

      this.questionRepo
        .createQueryBuilder('q')
        .select([
          `DATE(q.createdAt) as date`,
          `COUNT(q.id) as count`,
        ])
        .groupBy('DATE(q.createdAt)')
        .orderBy('DATE(q.createdAt)', 'ASC')
        .limit(30)
        .getRawMany(),
    ]);

    return {
      users: userSeries.map((r) => ({
        date: r.date,
        count: +r.count,
      })),
      questions: questionSeries.map((r) => ({
        date: r.date,
        count: +r.count,
      })),
    };
  }
}
