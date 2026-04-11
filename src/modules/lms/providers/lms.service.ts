// src/modules/admin/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';

@Injectable()
export class LmsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,

    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,

    @InjectRepository(QuizResult)
    private readonly quizResultRepo: Repository<QuizResult>,
  ) {}

  async getDashboardSummary(userId?: number) {
    const [questions, quizzes, timeSeries] = await Promise.all([
      this.getQuestionStats(userId),
      this.getQuizStats(userId),
      this.getTimeSeriesStats(userId),
    ]);

    return {
      questions,
      quizzes,
      timeSeries,
    };
  }

  private async getQuestionStats(userId?: number) {
    const qb = this.questionRepo
      .createQueryBuilder('q')
      .select([
        'COUNT(q.id) as total',
        `SUM(CASE WHEN q.questionType = :trivia THEN 1 ELSE 0 END) as totalTrivia`,
        `SUM(CASE WHEN q.questionType = :general THEN 1 ELSE 0 END) as totalGeneral`,
        `SUM(CASE WHEN q.status = :approved THEN 1 ELSE 0 END) as totalApproved`,
        `SUM(CASE WHEN q.status = :pending THEN 1 ELSE 0 END) as totalPending`,
        `SUM(CASE WHEN q.isWhitelisted = true THEN 1 ELSE 0 END) as totalWhitelisted`,
      ])
      .setParameters({
        trivia: QuestionTypeEnum.Trivia,
        general: QuestionTypeEnum.General,
        approved: QuestionStatusEnum.Active,
        pending: QuestionStatusEnum.Pending,
      });

    if (userId) {
      qb.andWhere('q.createdBy = :userId', { userId });
    }

    const questionStats = await qb.getRawOne();

    const totalApproved = +questionStats.totalApproved || 0;
    const totalPending = +questionStats.totalPending || 0;

    return {
      totalQuestions: +questionStats.total || 0,
      totalTrivia: +questionStats.totalTrivia || 0,
      totalGeneral: +questionStats.totalGeneral || 0,
      totalApproved,
      totalPending,
      totalWhitelisted: +questionStats.totalWhitelisted || 0,
      chart: {
        labels: ['Approved', 'Pending'],
        values: [totalApproved, totalPending],
      },
    };
  }

  private async getQuizStats(userId?: number) {
    if (!userId) {
      return {
        totalQuizCreated: 0,
      };
    }

    const quizStats = await this.quizRepo
      .createQueryBuilder('qz')
      .select('COUNT(qz.id)', 'total')
      .where('qz.createdBy = :userId', { userId })
      .andWhere('qz.quizType = :quizType', { quizType: QuizTypeEnum.Standard })
      .getRawOne();

    return {
      totalQuizCreated: +quizStats.total || 0,
    };
  }

  private async getTimeSeriesStats(userId?: number) {
    if (!userId) {
      return {
        daily: {
          questions: [],
          quizzes: [],
        },
        weekly: {
          questions: [],
          quizzes: [],
        },
      };
    }

    const dailyLimit = 30;
    const weeklyLimit = 8;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (dailyLimit - 1));
    startDate.setHours(0, 0, 0, 0);

    const startWeekDate = new Date(now);
    startWeekDate.setDate(now.getDate() - 7 * (weeklyLimit - 1));
    startWeekDate.setHours(0, 0, 0, 0);

    const questionDailyQb = this.questionRepo
      .createQueryBuilder('q')
      .select(['DATE(q.createdAt) as date', 'COUNT(q.id) as count'])
      .where('q.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(q.createdAt)')
      .orderBy('DATE(q.createdAt)', 'ASC');

    const quizDailyQb = this.quizRepo
      .createQueryBuilder('qz')
      .select(['DATE(qz.createdAt) as date', 'COUNT(qz.id) as count'])
      .where('qz.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('qz.quizType = :quizType', { quizType: QuizTypeEnum.Standard })
      .groupBy('DATE(qz.createdAt)')
      .orderBy('DATE(qz.createdAt)', 'ASC');

    const questionWeeklyQb = this.questionRepo
      .createQueryBuilder('q')
      .select([
        'YEAR(q.createdAt) as year',
        'WEEK(q.createdAt, 1) as week',
        'COUNT(q.id) as count',
      ])
      .where('q.createdAt >= :startWeekDate', { startWeekDate })
      .groupBy('YEAR(q.createdAt)')
      .addGroupBy('WEEK(q.createdAt, 1)')
      .orderBy('YEAR(q.createdAt)', 'DESC')
      .addOrderBy('WEEK(q.createdAt, 1)', 'DESC')
      .limit(weeklyLimit);

    const quizWeeklyQb = this.quizRepo
      .createQueryBuilder('qz')
      .select([
        'YEAR(qz.createdAt) as year',
        'WEEK(qz.createdAt, 1) as week',
        'COUNT(qz.id) as count',
      ])
      .where('qz.createdAt >= :startWeekDate', { startWeekDate })
      .andWhere('qz.quizType = :quizType', { quizType: QuizTypeEnum.Standard })
      .groupBy('YEAR(qz.createdAt)')
      .addGroupBy('WEEK(qz.createdAt, 1)')
      .orderBy('YEAR(qz.createdAt)', 'DESC')
      .addOrderBy('WEEK(qz.createdAt, 1)', 'DESC')
      .limit(weeklyLimit);

    questionDailyQb.andWhere('q.createdBy = :userId', { userId });
    quizDailyQb.andWhere('qz.createdBy = :userId', { userId });
    questionWeeklyQb.andWhere('q.createdBy = :userId', { userId });
    quizWeeklyQb.andWhere('qz.createdBy = :userId', { userId });

    const [questionDaily, quizDaily, questionWeeklyRaw, quizWeeklyRaw] =
      await Promise.all([
        questionDailyQb.getRawMany(),
        quizDailyQb.getRawMany(),
        questionWeeklyQb.getRawMany(),
        quizWeeklyQb.getRawMany(),
      ]);

    const normalizeDaily = (rows: any[]) =>
      rows.map((r) => ({ date: r.date, count: +r.count }));

    const normalizeWeekly = (rows: any[]) =>
      rows
        .slice()
        .reverse()
        .map((r) => ({
          week: `${r.year}-W${String(r.week).padStart(2, '0')}`,
          count: +r.count,
        }));

    return {
      daily: {
        questions: normalizeDaily(questionDaily),
        quizzes: normalizeDaily(quizDaily),
      },
      weekly: {
        questions: normalizeWeekly(questionWeeklyRaw),
        quizzes: normalizeWeekly(quizWeeklyRaw),
      },
    };
  }
}
