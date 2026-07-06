import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { generateScore } from 'src/common/utils/common-functions';
import { DataSource, Repository } from 'typeorm';
import { MeritService } from './merit.service';
import { TopicAnalysisService } from './topic-analysis.service';

@Injectable()
export class SubjectStatsService {
  constructor(
    @InjectRepository(JobRoleSubject)
    private readonly jobRoleSubjectRepo: Repository<JobRoleSubject>,

    @InjectRepository(UserSubject)
    private readonly userSubjectRepo: Repository<UserSubject>,

    @InjectRepository(SubjectTrack)
    private readonly subjectTrackRepo: Repository<SubjectTrack>,

    private readonly dataSource: DataSource,
    private readonly topicAnalyzer: TopicAnalysisService,
    private readonly meritService: MeritService,
  ) {}

  // ─── Subject Track Counts ─────────────────────────────────────────────────────

  async getSubjectTrackCounts(): Promise<Map<number, number>> {
    const rows = await this.subjectTrackRepo
      .createQueryBuilder('st')
      .select('st.subjectId', 'subjectId')
      .addSelect('COUNT(st.id)', 'count')
      .groupBy('st.subjectId')
      .getRawMany();
    return new Map(rows.map((r) => [+r.subjectId, +r.count]));
  }

  // ─── Core Subject Stats Query ─────────────────────────────────────────────────

  private async getSubjectStats(subjectId?: number, userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'subjectId')
      .addSelect('s.title', 'title')
      .addSelect('s.description', 'description')
      .addSelect('s.image', 'image')
      .addSelect('s.slug', 'slug')
      .addSelect('s.color', 'color')
      .addSelect('s.isPublished', 'isPublished')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active THEN q.id END)', 'numQuestions')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN q.status = :active AND q.questionType = :questionType THEN q.id END)',
        'numTrivia',
      )
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :easy THEN q.id END)', 'numEasyTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :medium THEN q.id END)', 'numIntTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :hard THEN q.id END)', 'numAdvTrivia')
      .from(Subject, 's')
      .where('s.isPublished = :isPublished', { isPublished: 1 })
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .setParameter('active', QuestionStatusEnum.Active)
      .setParameter('easy', DifficultyLevelEnum.Easy)
      .setParameter('medium', DifficultyLevelEnum.Intermediate)
      .setParameter('hard', DifficultyLevelEnum.Advanced)
      .groupBy('s.id');

    if (subjectId) qb.where('s.id = :subjectId', { subjectId });

    if (userId) {
      const latestAttemptSub = this.dataSource
        .createQueryBuilder()
        .subQuery()
        .select('qa2.questionId', 'questionId')
        .addSelect('MAX(qa2.id)', 'maxId')
        .from(QuestionAttempt, 'qa2')
        .where('qa2.userId = :userId', { userId })
        .groupBy('qa2.questionId')
        .getQuery();

      qb.leftJoin(`(${latestAttemptSub})`, 'la', 'la.questionId = q.id')
        .leftJoin('question_attempt', 'qa', 'qa.id = la.maxId')
        .addSelect('COUNT(DISTINCT qa.questionId)', 'attempted')
        .addSelect('SUM(CASE WHEN q.level = :easy AND qa.id IS NOT NULL THEN 1 ELSE 0 END)', 'attemptedEasy')
        .addSelect('SUM(CASE WHEN q.level = :medium AND qa.id IS NOT NULL THEN 1 ELSE 0 END)', 'attemptedMedium')
        .addSelect('SUM(CASE WHEN q.level = :hard AND qa.id IS NOT NULL THEN 1 ELSE 0 END)', 'attemptedHard')
        .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'correct')
        .addSelect('SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'correctEasy')
        .addSelect('SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'correctMedium')
        .addSelect('SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'correctHard')
        .addSelect(
          'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'wrong',
        )
        .addSelect('SUM(CASE WHEN qa.isSkipped = 1 THEN 1 ELSE 0 END)', 'skipped')
        .addSelect('CASE WHEN us.userId IS NOT NULL THEN 1 ELSE 0 END', 'isSubscribed')
        .leftJoin('user_subject', 'us', 'us.subjectId = s.id AND us.userId = :userId', { userId })
        .setParameter('userId', userId);
    } else {
      qb.addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped')
        .addSelect('false', 'isSubscribed');
    }

    if (subjectId) return qb.getRawOne();
    return qb.getRawMany();
  }

  /** Public accessor returning a Map keyed by subjectId — used by ProgramService. */
  async getSubjectStatsMap(userId?: number): Promise<Map<number, any>> {
    const rows = (await this.getSubjectStats(undefined, userId)) as any[];
    return new Map(rows.map((r) => [+r.subjectId, r]));
  }

  // ─── All Subjects (master list) ───────────────────────────────────────────────

  async getAllSubjects(userId?: number) {
    const [rows, trackCounts] = await Promise.all([
      this.getSubjectStats(undefined, userId),
      this.getSubjectTrackCounts(),
    ]);
    return (rows as any[]).map((r) => ({
      id: +r.subjectId,
      title: r.title,
      description: r.description,
      image: r.image,
      slug: r.slug,
      isPublished: r.isPublished,
      color: r.color,
      numQuestions: +r.numQuestions || 0,
      numTrivia: +r.numTrivia || 0,
      isSubscribed: r.isSubscribed === 1 || r.isSubscribed === '1',
      subjectTrackCount: trackCounts.get(+r.subjectId) ?? 0,
    }));
  }

  // ─── Single Subject Page ──────────────────────────────────────────────────────

  async getSubjectPage(slug: string, userId?: number) {
    const subject = await this.dataSource
      .getRepository(Subject)
      .findOne({ where: { slug }, select: ['id'] });
    if (!subject) throw new NotFoundException('Subject not found');

    const subjectId = subject.id;

    const [raw, syllabus, subjectMerits, popularTopicsMap, ratings] = await Promise.all([
      this.getSubjectStats(subjectId, userId),
      this.topicAnalyzer.getTopicStatsBySubject(subjectId, userId),
      this.meritService.getSubjectMeritsWithRanks([subjectId], userId),
      this.meritService.getPopularTopicsBySubject([subjectId]),
      userId ? this.getSubjectRatings(subjectId, userId) : Promise.resolve([]),
    ]);

    if (!raw) return null;

    const attempted = +raw.attempted || 0;
    const correct = +raw.correct || 0;
    const wrong = +raw.wrong || 0;
    const skipped = +raw.skipped || 0;
    const numTrivia = +raw.numTrivia || 0;
    const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
    const accuracy = attempted > 0 ? +(correct * 100 / attempted).toFixed(1) : 0;
    const score = +generateScore(attempted, correct, wrong).toFixed(0);

    return {
      id: +raw.subjectId,
      title: raw.title,
      description: raw.description,
      image: raw.image,
      slug: raw.slug,
      color: raw.color,
      isPublished: raw.isPublished,
      numQuestions: +raw.numQuestions || 0,
      numTrivia,
      numEasyTrivia: +raw.numEasyTrivia || 0,
      numIntTrivia: +raw.numIntTrivia || 0,
      numAdvTrivia: +raw.numAdvTrivia || 0,
      isSubscribed: raw.isSubscribed === 1 || raw.isSubscribed === '1',
      attempted,
      attemptedEasy: +raw.attemptedEasy || 0,
      attemptedMedium: +raw.attemptedMedium || 0,
      attemptedHard: +raw.attemptedHard || 0,
      correct,
      correctEasy: +raw.correctEasy || 0,
      correctMedium: +raw.correctMedium || 0,
      correctHard: +raw.correctHard || 0,
      wrong,
      skipped,
      accuracy,
      coverage,
      score,
      userRank: subjectMerits.userRanks.get(subjectId) ?? null,
      syllabus,
      meritList: subjectMerits.meritLists.get(subjectId) ?? [],
      popularTopics: popularTopicsMap.get(subjectId) ?? [],
      subjectRatings: ratings,
    };
  }

  // ─── Assessment Ratings ───────────────────────────────────────────────────────

  async getSubjectRatings(subjectId: number, userId: number) {
    const sessions = await this.dataSource
      .getRepository(AssessmentSession)
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.skillRatings', 'rating')
      .leftJoinAndSelect('session.rater', 'rater')
      .where('session.userId = :userId', { userId })
      .orderBy('session.id', 'DESC')
      .addOrderBy('rating.id', 'DESC')
      .getMany();

    return sessions.map((session) => ({
      id: session.id,
      assessmentTitle: session.assessmentTitle,
      createdAt: session.createdAt,
      ratingType: session.ratingType,
      ratedByName: session.rater
        ? `${session.rater.firstName ?? ''} ${session.rater.lastName ?? ''}`.trim()
        : null,
      skillRatings: session.skillRatings?.map((r) => ({
        id: r.id,
        skillId: r.skillId,
        skillType: r.skillType,
        rating: r.rating,
        createdAt: r.createdAt,
      })),
    }));
  }
}
