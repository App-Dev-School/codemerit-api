import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RatingTypeEnum } from 'src/common/enum/rating-type.enum';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { ApiUsageService } from 'src/common/services/api-usage.service';
import { SubjectAnalysisService } from 'src/modules/master/providers/subject-analysis.service';
import { UserPermissionService } from 'src/modules/user-permission/providers/user-permission.service';
import { UserService } from './user.service';

@Injectable()
export class UserProfileAggregatorService {
  constructor(
    private readonly userService: UserService,
    private readonly userPermissionService: UserPermissionService,
    private readonly subjectAnalysisService: SubjectAnalysisService,
    private readonly apiUsageService: ApiUsageService,
    private readonly dataSource: DataSource,
  ) {}

  async getFullProfile(username: string) {
    const user = await this.userService.findByUsername(username);

    const [courseStats, permissions, quizData, assessmentData, apiUsageRow] =
      await Promise.all([
        this.subjectAnalysisService.getJobSubjectDashboards(user.id, false),
        this.userPermissionService.getPermissionsForProfile(user.id),
        this.getRecentQuizzes(user.id),
        this.getAssessmentSessions(user.id),
        this.apiUsageService.findByUserId(user.id),
      ]);

    return {
      ...user,
      permissions,
      courseStats,
      quizzes: quizData,
      api_usage: {
        count: apiUsageRow?.count ?? 0,
        lastHitAt: apiUsageRow?.lastHitAt ?? null,
      },
      self_assessments: assessmentData.self_assessments,
      external_assessments: assessmentData.external_assessments,
    };
  }

  private async getRecentQuizzes(userId: number) {
    const rows = await this.dataSource
      .createQueryBuilder(QuizResult, 'qr')
      .leftJoin('qr.quiz', 'q')
      .select([
        'qr.id AS id',
        'qr.resultCode AS resultCode',
        'qr.total AS total',
        'qr.correct AS correct',
        'qr.wrong AS wrong',
        'qr.unanswered AS unanswered',
        'qr.timeSpent AS timeSpent',
        'qr.score AS score',
        'qr.status AS status',
        'qr.createdAt AS createdAt',
        'q.id AS quizId',
        'q.title AS quizTitle',
        'q.slug AS quizSlug',
        'q.quizType AS quizType',
        'q.level AS quizLevel',
      ])
      .where('qr.userId = :userId', { userId })
      .orderBy('qr.createdAt', 'DESC')
      .limit(10)
      .getRawMany();

    const recent = rows.map((r) => ({
      id: r.id,
      resultCode: r.resultCode,
      quiz: {
        id: r.quizId,
        title: r.quizTitle,
        slug: r.quizSlug,
        quizType: r.quizType,
        level: r.quizLevel,
      },
      score: Number(r.score) || 0,
      total: r.total,
      correct: r.correct,
      wrong: r.wrong,
      unanswered: r.unanswered,
      timeSpent: r.timeSpent,
      status: r.status,
      createdAt: r.createdAt,
    }));

    const totalTaken = recent.length;
    const avgScore =
      totalTaken > 0
        ? +(recent.reduce((s, r) => s + r.score, 0) / totalTaken).toFixed(1)
        : 0;
    const totalCorrect = recent.reduce((s, r) => s + (r.correct || 0), 0);
    const totalWrong = recent.reduce((s, r) => s + (r.wrong || 0), 0);

    return {
      recent,
      summary: { totalTaken, avgScore, totalCorrect, totalWrong },
    };
  }

  private async getAssessmentSessions(userId: number) {
    const [selfSessions, interviewSessions] = await Promise.all([
      this.fetchSessionsByType(userId, RatingTypeEnum.SELF),
      this.fetchSessionsByType(userId, RatingTypeEnum.INTERVIEW),
    ]);

    return {
      self_assessments: {
        sessions: selfSessions,
        summary: this.buildAssessmentSummary(selfSessions),
      },
      external_assessments: {
        sessions: interviewSessions,
        summary: this.buildAssessmentSummary(interviewSessions),
      },
    };
  }

  private async fetchSessionsByType(
    userId: number,
    ratingType: RatingTypeEnum,
  ) {
    const sessions = await this.dataSource
      .getRepository(AssessmentSession)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.skillRatings', 'sr')
      .where('s.userId = :userId', { userId })
      .andWhere('s.ratingType = :ratingType', { ratingType })
      .orderBy('s.createdAt', 'DESC')
      .take(5)
      .getMany();

    return sessions.map((s) => ({
      id: s.id,
      assessmentTitle: s.assessmentTitle,
      ratingType: s.ratingType,
      createdAt: s.createdAt,
      skillRatings: (s.skillRatings || []).map((r) => ({
        skillId: r.skillId,
        skillType: r.skillType,
        rating: r.rating,
      })),
    }));
  }

  private buildAssessmentSummary(sessions: Array<{ skillRatings: Array<{ rating: number }> }>) {
    const totalSessions = sessions.length;
    if (!totalSessions) return { totalSessions: 0, avgRating: 0 };

    const allRatings = sessions.flatMap((s) =>
      s.skillRatings.map((r) => r.rating),
    );
    const avgRating =
      allRatings.length > 0
        ? +(
            allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
          ).toFixed(1)
        : 0;

    return { totalSessions, avgRating };
  }
}
