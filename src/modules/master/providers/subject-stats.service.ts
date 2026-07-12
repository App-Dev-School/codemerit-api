import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { UserLessonTrackerStatusEnum } from 'src/common/enum/user-lesson-tracker-status.enum';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { Certificate } from 'src/common/typeorm/entities/certificate.entity';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { generateScore, getAggregateUserLevel } from 'src/common/utils/common-functions';
import { DataSource, In, Repository } from 'typeorm';
import { MeritService } from './merit.service';
import { TopicAnalysisService } from './topic-analysis.service';
import { SubjectTrackAnalysisService } from './subject-track-analysis.service';

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
    private readonly subjectTrackAnalyzer: SubjectTrackAnalysisService,
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
        .addSelect(
          'SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'wrongEasy',
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'wrongMedium',
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'wrongHard',
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

    const [raw, syllabus, subjectMerits, popularTopicsMap, ratings, lessons, relatedJobRoles] = await Promise.all([
      this.getSubjectStats(subjectId, userId),
      this.topicAnalyzer.getTopicStatsBySubject(subjectId, userId),
      this.meritService.getSubjectMeritsWithRanks([subjectId], userId),
      this.meritService.getPopularTopicsBySubject([subjectId]),
      userId ? this.getSubjectRatings(subjectId, userId) : Promise.resolve([]),
      this.getSubjectLessons(subjectId, userId),
      this.getRelatedJobRoles(subjectId),
    ]);

    if (!raw) return null;

    // Reuse the per-topic stats already computed for `syllabus` — avoids a second
    // grouped join over question_topic/question for the same topic set.
    const topicStatsMap = new Map<number, any>(syllabus.map((t: any) => [t.id, t]));
    const subjectTracks = await this.subjectTrackAnalyzer.getSubjectTracksBySubject(
      subjectId,
      topicStatsMap,
      userId,
    );
    const subjectTrackMap = new Map<number, any>(subjectTracks.map((st: any) => [st.id, st]));
    const certificationTracks = await this.getCertificationTracksForSubject(
      [...subjectTrackMap.keys()],
      subjectTrackMap,
      userId,
    );

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
      wrongEasy: +raw.wrongEasy || 0,
      wrongMedium: +raw.wrongMedium || 0,
      wrongHard: +raw.wrongHard || 0,
      userLevel: getAggregateUserLevel(
        +raw.attemptedEasy || 0, +raw.correctEasy || 0,
        +raw.attemptedMedium || 0, +raw.correctMedium || 0,
        +raw.attemptedHard || 0, +raw.correctHard || 0,
      ),
      skipped,
      accuracy,
      coverage,
      score,
      userRank: subjectMerits.userRanks.get(subjectId) ?? null,
      syllabus,
      subjectTracks,
      certificationTracks,
      lessons,
      relatedJobRoles,
      meritList: subjectMerits.meritLists.get(subjectId) ?? [],
      popularTopics: popularTopicsMap.get(subjectId) ?? [],
      subjectRatings: ratings,
    };
  }

  // ─── Certification Tracks (via SubjectTrack -> CertificationTrackSubjectTrack) ─

  private async getCertificationTracksForSubject(
    subjectTrackIds: number[],
    subjectTrackMap: Map<number, any>,
    userId?: number,
  ) {
    if (!subjectTrackIds.length) return [];

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('ct.id', 'ctId')
      .addSelect('ct.title', 'ctTitle')
      .addSelect('ct.description', 'ctDesc')
      .addSelect('ct.sortOrder', 'ctSortOrder')
      .addSelect('jr.id', 'jrId')
      .addSelect('jr.title', 'jrTitle')
      .addSelect('jr.slug', 'jrSlug')
      .addSelect('jr.image', 'jrImage')
      .addSelect('jr.color', 'jrColor')
      .addSelect('ctst.subjectTrackId', 'stId')
      .from('certification_track_subject_track', 'ctst')
      .innerJoin('certification_track', 'ct', 'ct.id = ctst.certificationTrackId AND ct.isPublished = 1')
      .innerJoin('job_role', 'jr', 'jr.id = ct.jobRoleId AND jr.isPublished = 1')
      .where('ctst.subjectTrackId IN (:...subjectTrackIds)', { subjectTrackIds })
      .orderBy('ct.sortOrder', 'ASC')
      .getRawMany();

    if (!rows.length) return [];

    const ctIds = [...new Set(rows.map((r) => +r.ctId))];

    const [totalRows, myCertificates] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('ctst.certificationTrackId', 'ctId')
        .addSelect('COUNT(DISTINCT ctst.subjectTrackId)', 'total')
        .from('certification_track_subject_track', 'ctst')
        .innerJoin('subject_track', 'st', 'st.id = ctst.subjectTrackId AND st.isPublished = 1')
        .where('ctst.certificationTrackId IN (:...ctIds)', { ctIds })
        .groupBy('ctst.certificationTrackId')
        .getRawMany(),
      userId
        ? this.dataSource
            .getRepository(Certificate)
            .find({ where: { userId, certificationTrackId: In(ctIds) } })
        : Promise.resolve([]),
    ]);

    const totalMap = new Map<number, number>(totalRows.map((r) => [+r.ctId, +r.total]));
    const certMap = new Map<number, Certificate>(myCertificates.map((c) => [c.certificationTrackId, c]));

    type CtEntry = { meta: any; stIds: number[] };
    const ctIndex = new Map<number, CtEntry>();
    for (const row of rows) {
      const ctId = +row.ctId;
      if (!ctIndex.has(ctId)) {
        ctIndex.set(ctId, {
          meta: {
            id: ctId,
            title: row.ctTitle,
            description: row.ctDesc,
            sortOrder: +row.ctSortOrder,
            jobRole: {
              id: +row.jrId, title: row.jrTitle, slug: row.jrSlug,
              image: row.jrImage, color: row.jrColor,
            },
          },
          stIds: [],
        });
      }
      ctIndex.get(ctId)!.stIds.push(+row.stId);
    }

    return [...ctIndex.values()]
      .sort((a, b) => a.meta.sortOrder - b.meta.sortOrder)
      .map(({ meta, stIds }) => {
        const subjectTracks = stIds
          .map((id) => subjectTrackMap.get(id))
          .filter(Boolean)
          .map((st: any) => ({
            id: st.id, title: st.title, slug: st.slug, totalTopics: st.totalTopics,
            progressPercent: st.progressPercent, score: st.score, isCompleted: st.isCompleted,
            attemptedEasy: st.attemptedEasy, attemptedMedium: st.attemptedMedium, attemptedHard: st.attemptedHard,
            correctEasy: st.correctEasy, correctMedium: st.correctMedium, correctHard: st.correctHard,
            wrongEasy: st.wrongEasy, wrongMedium: st.wrongMedium, wrongHard: st.wrongHard,
            userLevel: st.userLevel,
          }));

        const card: any = {
          ...meta,
          totalSubjectTracks: totalMap.get(meta.id) ?? subjectTracks.length,
          subjectTracks,
        };

        if (userId) {
          const cert = certMap.get(meta.id);
          card.myCertificate = cert
            ? {
                certificateNumber: cert.certificateNumber, status: cert.status,
                issuedAt: cert.issuedAt, pdfUrl: cert.pdfUrl,
              }
            : null;
        }

        return card;
      });
  }

  // ─── Lessons ────────────────────────────────────────────────────────────────

  private async getSubjectLessons(subjectId: number, userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('l.id', 'id')
      .addSelect('l.title', 'title')
      .addSelect('l.slug', 'slug')
      .addSelect('l.level', 'level')
      .addSelect('l.topicId', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.slug', 'topicSlug')
      .addSelect('COUNT(DISTINCT ls.id)', 'numSections')
      .from('lesson', 'l')
      .leftJoin('topic', 't', 't.id = l.topicId')
      .leftJoin('lesson_section', 'ls', 'ls.lessonId = l.id')
      .where('l.subjectId = :subjectId', { subjectId })
      .groupBy('l.id')
      .addGroupBy('t.id')
      .orderBy('t.order', 'ASC')
      .addOrderBy('l.id', 'ASC');

    if (userId) {
      qb.leftJoin('user_lesson_tracker', 'ult', 'ult.lessonId = l.id AND ult.userId = :userId', { userId })
        .addSelect('ult.status', 'status')
        .addSelect('ult.views', 'views')
        .addGroupBy('ult.id');
    }

    const rows = await qb.getRawMany();

    const list = rows.map((r) => ({
      id: +r.id,
      title: r.title,
      slug: r.slug,
      level: +r.level,
      topicId: r.topicId ? +r.topicId : null,
      topicTitle: r.topicTitle ?? null,
      topicSlug: r.topicSlug ?? null,
      numSections: +r.numSections || 0,
      status: userId ? (r.status ?? UserLessonTrackerStatusEnum.Pending) : null,
      views: userId ? +r.views || 0 : 0,
    }));

    const completed = userId
      ? list.filter((l) => l.status === UserLessonTrackerStatusEnum.Completed).length
      : 0;

    return { total: list.length, completed, list };
  }

  // ─── Related Job Roles ────────────────────────────────────────────────────────

  private async getRelatedJobRoles(subjectId: number) {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('jr.id', 'id')
      .addSelect('jr.title', 'title')
      .addSelect('jr.slug', 'slug')
      .addSelect('jr.image', 'image')
      .addSelect('jr.color', 'color')
      .addSelect('jrs.tag', 'tag')
      .from('job_role_subject', 'jrs')
      .innerJoin('job_role', 'jr', 'jr.id = jrs.jobRoleId AND jr.isPublished = 1')
      .where('jrs.subjectId = :subjectId', { subjectId })
      .orderBy('jrs.sortOrder', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id, title: r.title, slug: r.slug, image: r.image, color: r.color, tag: r.tag,
    }));
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
