import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { generateScore } from 'src/common/utils/common-functions';
import { DataSource, Repository } from 'typeorm';
import { TopicAnalysisService } from './topic-analysis.service';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';

@Injectable()
export class SubjectAnalysisService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(JobRoleSubject)
    private jobRoleSubjectRepo: Repository<JobRoleSubject>,

    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,

    @InjectRepository(UserJobRole)
    private userJobRoleRepo: Repository<UserJobRole>,

    @InjectRepository(UserSubject)
    private readonly userSubjectRepo: Repository<UserSubject>,

    @InjectRepository(SubjectTrack)
    private readonly subjectTrackRepo: Repository<SubjectTrack>,

    private readonly dataSource: DataSource,
    private topicAnalyzer: TopicAnalysisService
  ) { }

  private async getSubjectTrackCounts(): Promise<Map<number, number>> {
    const rows = await this.subjectTrackRepo
      .createQueryBuilder('st')
      .select('st.subjectId', 'subjectId')
      .addSelect('COUNT(st.id)', 'count')
      .groupBy('st.subjectId')
      .getRawMany();
    return new Map(rows.map((r) => [+r.subjectId, +r.count]));
  }

  /**
   * Core query for subject stats.
   * - If subjectId provided -> returns one row (getRawOne).
   * - Else returns all subjects (getRawMany).
   *
   * Uses latest-attempt-per-question logic (subquery) when userId is provided,
   * so counts are per-question (not per-attempt row).
   */
  private async getSubjectStats(subjectId?: number, userId?: number) {
    const isPublished = 1;
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
        'numTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :easy THEN q.id END)', 'numEasyTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :medium THEN q.id END)', 'numIntTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :hard THEN q.id END)', 'numAdvTrivia')
      .from(Subject, 's')
      .where('s.isPublished = :isPublished', { isPublished })
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .setParameter('active', QuestionStatusEnum.Active)
      .setParameter('easy', DifficultyLevelEnum.Easy)
      .setParameter('medium', DifficultyLevelEnum.Intermediate)
      .setParameter('hard', DifficultyLevelEnum.Advanced)
      .groupBy('s.id')

    if (subjectId) {
      qb.where('s.id = :subjectId', { subjectId });
    }

    if (userId) {
      // Subquery: latest attempt id per question for this user
      const latestAttemptSub = this.dataSource
        .createQueryBuilder()
        .subQuery()
        .select('qa2.questionId', 'questionId')
        .addSelect('MAX(qa2.id)', 'maxId')
        .from(QuestionAttempt, 'qa2')
        .where('qa2.userId = :userId', { userId })
        .groupBy('qa2.questionId')
        .getQuery();

      // join that subquery -> join the attempt rows (one per question)
      qb
        .leftJoin(`(${latestAttemptSub})`, 'la', 'la.questionId = q.id')
        .leftJoin('question_attempt', 'qa', 'qa.id = la.maxId')
        // attempted = number of distinct questions user has latest attempts for (one per question)
        .addSelect('COUNT(qa.id)', 'totalAttempted')
        .addSelect('COUNT(DISTINCT qa.questionId)', 'attempted')
        .addSelect(
          'SUM(CASE WHEN q.level = :easy AND qa.id IS NOT NULL THEN 1 ELSE 0 END)',
          'attemptedEasy'
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :medium AND qa.id IS NOT NULL THEN 1 ELSE 0 END)',
          'attemptedMedium'
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :hard AND qa.id IS NOT NULL THEN 1 ELSE 0 END)',
          'attemptedHard'
        )
        // correct/wrong/skipped computed from the latest attempt per question
        .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'correct')
        .addSelect(
          'SUM(CASE WHEN q.level = :easy AND qa.isCorrect = 1 THEN 1 ELSE 0 END)',
          'correctEasy'
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :medium AND qa.isCorrect = 1 THEN 1 ELSE 0 END)',
          'correctMedium'
        )
        .addSelect(
          'SUM(CASE WHEN q.level = :hard AND qa.isCorrect = 1 THEN 1 ELSE 0 END)',
          'correctHard'
        )
        .addSelect(
          'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
          'wrong'
        )
        .addSelect('SUM(CASE WHEN qa.isSkipped = 1 THEN 1 ELSE 0 END)', 'skipped')
        // subscription flag
        .addSelect('CASE WHEN us.userId IS NOT NULL THEN 1 ELSE 0 END', 'isSubscribed')
        .leftJoin(
          'user_subject',
          'us',
          'us.subjectId = s.id AND us.userId = :userId',
          { userId }
        )
        .setParameter('userId', userId);
    } else {
      qb
        .addSelect('0', 'totalAttempted')
        .addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped')
        .addSelect('false', 'isSubscribed');
    }

    if (subjectId) {
      return qb.getRawOne();
    }
    return qb.getRawMany();
  }

  /**
   * The central method — returns a subject dashboard object.
   * - fullData=true will include meritList & popularTopics (expensive)
   */
  async getSubjectDashboard(subjectId: number, userId?: number, fullData = false) {
    const row = await this.getSubjectStats(subjectId, userId);
    if (!row) return null;
    const attempted = +row.attempted || 0;
    const correct = +row.correct || 0;
    const wrong = +row.wrong || 0;
    const skipped = +row.skipped || 0;
    const numTrivia = +row.numTrivia || 0;

    const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
    const avgAccuracy = Number(
      (attempted > 0 ? (correct * 100) / attempted : 0).toFixed(1)
    );

    // generateScore is expected to return 0..100 (normalized percentage)
    const baseScore = generateScore(attempted, correct, wrong);
    const score = Number(baseScore.toFixed(0));

    const dashboard: any = {
      id: +row.subjectId,
      title: row.title,
      description: row.description,
      image: row.image,
      slug: row.slug,
      isPublished: row.isPublished,
      color: row.color,
      numQuestions: +row.numQuestions || 0,
      numTrivia,
      numEasyTrivia: row.numEasyTrivia,
      numIntTrivia: row.numIntTrivia,
      numAdvTrivia: row.numAdvTrivia,
      isSubscribed: row.isSubscribed === 1 || row.isSubscribed === '1',
      attempted,
      attemptedEasy: row.attemptedEasy,
      attemptedMedium: row.attemptedMedium,
      attemptedHard: row.attemptedHard,
      correct,
      correctEasy : row.correctEasy,
      correctMedium : row.correctMedium,
      correctHard : row.correctHard,
      wrong,
      skipped,
      avgAccuracy,
      coverage,
      score,
      syllabus: [],
      meritList: [],
      popularTopics: [],
      subjectRatings: []
    };

    if (fullData) {
      // Pass subjectId to both calls; getMeritList computes its own numTrivia.
      [dashboard.meritList, dashboard.syllabus, dashboard.popularTopics, dashboard.subjectRatings] = await Promise.all([
        this.getMeritList(subjectId),
        this.topicAnalyzer.getTopicStatsBySubject(subjectId, userId),
        this.getPopularTopics(subjectId),
        this.getSubjectRatings(subjectId, userId)
      ]);
    }

    return dashboard;
  }

  /** all subjects (master) — minimal fields */
  async getAllSubjects(userId?: number) {
    const [rows, subjectTrackCounts] = await Promise.all([
      this.getSubjectStats(undefined, userId),
      this.getSubjectTrackCounts(),
    ]);
    return rows.map((r) => ({
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
      subjectTrackCount: subjectTrackCounts.get(+r.subjectId) ?? 0,
    }));
  }

  /** dashboards for subscribed subjects */
  async getSubscribedSubjectDashboards(userId: number, fullData = false) {
    const subs = await this.userSubjectRepo
      .createQueryBuilder('us')
      .select('us.subjectId', 'subjectId')
      .where('us.userId = :userId', { userId })
      .getRawMany();

    if (!subs.length) return [];

    return Promise.all(
      subs.map((s) => this.getSubjectDashboard(+s.subjectId, userId, fullData))
    );
  }

  async getJobSubjectDashboards(userId: number, fullData = false) {
  // Step 1: Get all job roles for the user
  const userJobRoles = await this.userJobRoleRepo
    .createQueryBuilder('ujr')
    .select('ujr.jobRoleId', 'jobRoleId')
    .where('ujr.userId = :userId', { userId })
    .getRawMany();

  if (!userJobRoles.length) return [];

  const jobRoleIds = userJobRoles.map((r) => r.jobRoleId);

  // Step 2: Get subjects mapped to these job roles
  const roleSubjects = await this.jobRoleSubjectRepo
    .createQueryBuilder('jrs')
    .select('DISTINCT jrs.subjectId', 'subjectId')
    .where('jrs.jobRoleId IN (:...jobRoleIds)', { jobRoleIds })
    .getRawMany();

  if (!roleSubjects.length) return [];

  // Step 3: Fetch dashboards for unique subjects
  return Promise.all(
    roleSubjects.map((s) =>
      this.getSubjectDashboard(+s.subjectId, userId, fullData),
    ),
  );
}

  // ─── Career Dashboard ────────────────────────────────────────────────────────

  private static readonly TOPIC_COMPLETION_THRESHOLD = 70;       // coverage % to mark a topic done
  private static readonly SUBJECTTRACK_COMPLETION_THRESHOLD = 70; // % of topics done to mark a track done
  private static readonly CERT_ACHIEVEMENT_THRESHOLD = 80;        // % of subject tracks done to "achieve" a cert

  async getCareerDashboard(userId: number) {
    // 1. User's job roles with metadata
    const jobRoles = await this.dataSource
      .createQueryBuilder()
      .select('jr.id', 'id')
      .addSelect('jr.title', 'title')
      .addSelect('jr.slug', 'slug')
      .addSelect('jr.image', 'image')
      .addSelect('jr.color', 'color')
      .addSelect('jr.description', 'description')
      .from(JobRole, 'jr')
      .innerJoin('user_job_role', 'ujr', 'ujr.jobRoleId = jr.id')
      .where('ujr.userId = :userId', { userId })
      .andWhere('jr.isPublished = 1')
      .orderBy('jr.orderId', 'ASC')
      .getRawMany();

    if (!jobRoles.length) {
      return {
        overallSummary: { totalSubjects: 0, overallReadiness: 0, totalCertificationTracks: 0, certTracksAchieved: 0, certTracksInProgress: 0, certTracksNotStarted: 0 },
        jobRoles: [],
      };
    }

    const jobRoleIds = jobRoles.map((jr) => +jr.id);

    // 2. Subjects per job role with tag + sortOrder
    const roleSubjectRows = await this.dataSource
      .createQueryBuilder()
      .select('jrs.jobRoleId', 'jobRoleId')
      .addSelect('jrs.subjectId', 'subjectId')
      .addSelect('jrs.tag', 'tag')
      .addSelect('jrs.sortOrder', 'sortOrder')
      .addSelect('s.title', 'sTitle')
      .addSelect('s.slug', 'sSlug')
      .addSelect('s.color', 'sColor')
      .addSelect('s.image', 'sImage')
      .from(JobRoleSubject, 'jrs')
      .innerJoin('subject', 's', 's.id = jrs.subjectId AND s.isPublished = 1')
      .where('jrs.jobRoleId IN (:...jobRoleIds)', { jobRoleIds })
      .orderBy('jrs.jobRoleId', 'ASC')
      .addOrderBy('jrs.sortOrder', 'ASC')
      .getRawMany();

    const allSubjectIds = [...new Set(roleSubjectRows.map((rs) => +rs.subjectId))];

    // 3. Subject stats for all relevant subjects (reuse existing query, filter in-memory)
    const allSubjectStats: any[] = (await this.getSubjectStats(undefined, userId)) as any[];
    const subjectStatsMap = new Map<number, any>(
      allSubjectStats
        .filter((s) => allSubjectIds.includes(+s.subjectId))
        .map((s) => [+s.subjectId, s]),
    );

    // 4. Certification track hierarchy: certTrack → subjectTrack → topic
    const certRows = await this.dataSource
      .createQueryBuilder()
      .select('ct.id', 'ctId')
      .addSelect('ct.title', 'ctTitle')
      .addSelect('ct.description', 'ctDesc')
      .addSelect('ct.sortOrder', 'ctSortOrder')
      .addSelect('ct.jobRoleId', 'ctJobRoleId')
      .addSelect('st.id', 'stId')
      .addSelect('st.title', 'stTitle')
      .addSelect('st.slug', 'stSlug')
      .addSelect('st.description', 'stDesc')
      .addSelect('st.sortOrder', 'stSortOrder')
      .addSelect('st.subjectId', 'stSubjectId')
      .addSelect('s.title', 'stSubjectTitle')
      .addSelect('s.slug', 'stSubjectSlug')
      .addSelect('t.id', 'tId')
      .addSelect('t.title', 'tTitle')
      .addSelect('t.slug', 'tSlug')
      .addSelect('t.label', 'tLabel')
      .addSelect('t.order', 'tOrder')
      .from('certification_track', 'ct')
      .innerJoin('certification_track_subject_track', 'ctst', 'ctst.certificationTrackId = ct.id')
      .innerJoin('subject_track', 'st', 'st.id = ctst.subjectTrackId AND st.isPublished = 1')
      .innerJoin('subject', 's', 's.id = st.subjectId')
      .innerJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
      .innerJoin('topic', 't', 't.id = stt.topicId AND t.isPublished = 1')
      .where('ct.jobRoleId IN (:...jobRoleIds)', { jobRoleIds })
      .andWhere('ct.isPublished = 1')
      .orderBy('ct.jobRoleId', 'ASC')
      .addOrderBy('ct.sortOrder', 'ASC')
      .addOrderBy('st.sortOrder', 'ASC')
      .addOrderBy('t.order', 'ASC')
      .getRawMany();

    // 5. Topic stats for every topic appearing in cert tracks
    const allTopicIds = [...new Set(certRows.map((r) => +r.tId))];
    const topicStatsList = allTopicIds.length
      ? await this.topicAnalyzer.getTopicStatsByIds(allTopicIds, userId)
      : [];
    const topicStatsMap = new Map<number, any>(topicStatsList.map((t) => [t.id, t]));

    // 6. Index certRows: jobRoleId → certTrackId → subjectTrackId → topicIds[]
    type TrackEntry = { meta: any; topicIds: number[] };
    type CertEntry = { meta: any; tracks: Map<number, TrackEntry> };
    const certByJobRole = new Map<number, Map<number, CertEntry>>();

    for (const row of certRows) {
      const jrId = +row.ctJobRoleId;
      if (!certByJobRole.has(jrId)) certByJobRole.set(jrId, new Map());
      const certMap = certByJobRole.get(jrId)!;

      if (!certMap.has(+row.ctId)) {
        certMap.set(+row.ctId, {
          meta: { id: +row.ctId, title: row.ctTitle, description: row.ctDesc, sortOrder: +row.ctSortOrder },
          tracks: new Map(),
        });
      }
      const cert = certMap.get(+row.ctId)!;

      if (!cert.tracks.has(+row.stId)) {
        cert.tracks.set(+row.stId, {
          meta: {
            id: +row.stId, title: row.stTitle, slug: row.stSlug,
            description: row.stDesc, sortOrder: +row.stSortOrder,
            subject: { id: +row.stSubjectId, title: row.stSubjectTitle, slug: row.stSubjectSlug },
          },
          topicIds: [],
        });
      }
      cert.tracks.get(+row.stId)!.topicIds.push(+row.tId);
    }

    // 7. Index subjects by jobRole
    const subjectsByJobRole = new Map<number, any[]>();
    for (const rs of roleSubjectRows) {
      const jrId = +rs.jobRoleId;
      if (!subjectsByJobRole.has(jrId)) subjectsByJobRole.set(jrId, []);
      const raw = subjectStatsMap.get(+rs.subjectId) ?? {};
      const attempted = +raw.attempted || 0;
      const correct = +raw.correct || 0;
      const wrong = +raw.wrong || 0;
      const skipped = +raw.skipped || 0;
      const numTrivia = +raw.numTrivia || 0;
      const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
      const accuracy = attempted > 0 ? +(correct * 100 / attempted).toFixed(1) : 0;
      const score = +generateScore(attempted, correct, wrong).toFixed(0);
      subjectsByJobRole.get(jrId)!.push({
        id: +rs.subjectId,
        title: rs.sTitle, slug: rs.sSlug, color: rs.sColor, image: rs.sImage,
        tag: rs.tag, sortOrder: +rs.sortOrder,
        isSubscribed: raw.isSubscribed === 1 || raw.isSubscribed === '1',
        numQuestions: +raw.numQuestions || 0, numTrivia,
        attempted, correct, wrong, skipped,
        accuracy, coverage, score,
      });
    }

    // 8. Assemble response
    let totalSubjects = 0, totalCerts = 0, certsAchieved = 0, certsInProgress = 0;
    const allReadinessScores: number[] = [];

    const jobRoleDashboards = jobRoles.map((jr) => {
      const subjects = subjectsByJobRole.get(+jr.id) ?? [];
      totalSubjects += subjects.length;

      const mandatorySubjects = subjects.filter((s) => s.tag === 'MANDATORY');
      const scoreSources = mandatorySubjects.length ? mandatorySubjects : subjects;
      const readinessScore = scoreSources.length
        ? +((scoreSources.reduce((sum, s) => sum + s.score, 0) / scoreSources.length)).toFixed(0)
        : 0;
      allReadinessScores.push(...scoreSources.map((s) => s.score));

      const certMap = certByJobRole.get(+jr.id) ?? new Map();
      const certificationTracks = [...certMap.values()].map(({ meta: ct, tracks }) => {
        const subjectTracks = [...tracks.values()].map(({ meta: st, topicIds }) => {

          // Topic-level stats
          const topics = topicIds.map((tid) => {
            const ts = topicStatsMap.get(tid) ?? {};
            const numTrivia = +ts.numTrivia || 0;
            const myUniqueAttempted = +ts.myUniqueAttempts || 0;
            const myAllAttempts = +ts.myAllAttempts || 0;
            const correct = +ts.correct || 0;
            const wrong = +ts.wrong || 0;
            const coverage = numTrivia > 0 ? +((myUniqueAttempted / numTrivia) * 100).toFixed(1) : 0;
            const accuracy = myAllAttempts > 0 ? +(correct * 100 / myAllAttempts).toFixed(1) : 0;
            const score = +generateScore(myAllAttempts, correct, wrong).toFixed(0);
            const isCompleted = coverage >= SubjectAnalysisService.TOPIC_COMPLETION_THRESHOLD;
            return {
              id: tid, title: ts.title, slug: ts.slug, label: ts.label,
              numTrivia, attempted: myUniqueAttempted, correct, wrong,
              accuracy, coverage, score, isCompleted,
            };
          });

          // SubjectTrack aggregate score and progress
          const stNumTrivia = topics.reduce((sum: number, t: any) => sum + t.numTrivia, 0);
          const stUniqueAttempted = topics.reduce((sum: number, t: any) => sum + t.attempted, 0);
          const stAllAttempts = topicIds.reduce((sum: number, tid: number) => sum + (+(topicStatsMap.get(tid)?.myAllAttempts) || 0), 0);
          const stCorrect = topics.reduce((sum: number, t: any) => sum + t.correct, 0);
          const stWrong = topics.reduce((sum: number, t: any) => sum + t.wrong, 0);
          const stCoverage = stNumTrivia > 0 ? +((stUniqueAttempted / stNumTrivia) * 100).toFixed(1) : 0;
          const stAccuracy = stAllAttempts > 0 ? +(stCorrect * 100 / stAllAttempts).toFixed(1) : 0;
          const stScore = +generateScore(stAllAttempts, stCorrect, stWrong).toFixed(0);

          const totalTopics = topics.length;
          const completedTopics = topics.filter((t) => t.isCompleted).length;
          const progressPercent = totalTopics > 0
            ? +((completedTopics / totalTopics) * 100).toFixed(0)
            : 0;
          const isCompleted = progressPercent >= SubjectAnalysisService.SUBJECTTRACK_COMPLETION_THRESHOLD;

          return {
            ...st,
            numTrivia: stNumTrivia,
            attempted: stUniqueAttempted,
            correct: stCorrect,
            wrong: stWrong,
            coverage: stCoverage,
            accuracy: stAccuracy,
            score: stScore,
            totalTopics,
            completedTopics,
            progressPercent,
            isCompleted,
            topics,
          };
        });

        const totalSubjectTracks = subjectTracks.length;
        const completedSubjectTracks = subjectTracks.filter((st) => st.isCompleted).length;
        const progressPercent = totalSubjectTracks > 0
          ? +((completedSubjectTracks / totalSubjectTracks) * 100).toFixed(0)
          : 0;
        const isAchieved = progressPercent >= SubjectAnalysisService.CERT_ACHIEVEMENT_THRESHOLD;

        totalCerts++;
        if (isAchieved) certsAchieved++;
        else if (completedSubjectTracks > 0) certsInProgress++;

        return {
          ...ct,
          totalSubjectTracks,
          completedSubjectTracks,
          progressPercent,
          isAchieved,
          achievementThreshold: SubjectAnalysisService.CERT_ACHIEVEMENT_THRESHOLD,
          subjectTracks,
        };
      });

      return {
        id: +jr.id, title: jr.title, slug: jr.slug,
        image: jr.image, color: jr.color, description: jr.description,
        readinessScore, subjects, certificationTracks,
      };
    });

    const overallReadiness = allReadinessScores.length
      ? +((allReadinessScores.reduce((a, b) => a + b, 0) / allReadinessScores.length)).toFixed(0)
      : 0;

    return {
      overallSummary: {
        totalSubjects,
        overallReadiness,
        totalCertificationTracks: totalCerts,
        certTracksAchieved: certsAchieved,
        certTracksInProgress: certsInProgress,
        certTracksNotStarted: totalCerts - certsAchieved - certsInProgress,
      },
      jobRoles: jobRoleDashboards,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────

  async getJobSubjectDashboardsOLD(userId: number, fullData = false) {
    // Step 1: Get the user with designation (job role id)
    const user = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.designation'])
      .where('u.id = :userId', { userId })
      .getOne();

    //if (!user?.designation) return [];

    // Step 2: Get subjects mapped to that job role
    const roleSubjects = await this.jobRoleSubjectRepo
      .createQueryBuilder('jrs')
      .select('jrs.subjectId', 'subjectId')
      .where('jrs.jobRoleId = :jobId', { jobId: user.designation })
      .getRawMany();

    if (!roleSubjects.length) return [];

    // Step 3: Fetch dashboards for those subjects
    return Promise.all(
      roleSubjects.map((s) =>
        this.getSubjectDashboard(+s.subjectId, userId, fullData),
      ),
    );
  }


  async getSubjectDashboardBySlug(slug: string, userId?: number, fullData = false) {
    const subject = await this.dataSource.getRepository(Subject).findOne({
      where: { slug },
      select: ['id']
    });
    if (!subject) {
      throw new NotFoundException(`Subject not found`);
    }
    return this.getSubjectDashboard(subject.id, userId, fullData);
  }

  /**
   * Merit list:
   * - We take the latest-attempt-per-(user,question) across all users,
   *   then restrict to questions of this subject and aggregate per user.
   * - totalAttempts = number of distinct questions the user attempted (latest attempt counted once)
   * - totalCorrect / totalWrong computed from those latest attempts
   * - coverage = totalAttempts / numTrivia (subject-level)
   * - baseScore = generateScore(totalAttempts, totalCorrect, totalWrong)
   * - final score for ranking = 0.8 * baseScore + 0.2 * coverage   (20% weight to coverage)
   * - rank assigned with tie-handling (same score -> same rank)
   */
  private async getMeritList(subjectId: number) {
    // 1) count number of trivia questions in subject
    const numTriviaRow = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT q.id)', 'numTrivia')
      .from('question', 'q')
      .where('q.subjectId = :subjectId', { subjectId })
      .andWhere('q.questionType = :questionType', {
        questionType: QuestionTypeEnum.Trivia
      })
      .getRawOne();

    const numTrivia = +numTriviaRow?.numTrivia || 0;

    // 2) subquery: latest attempt id per (userId, questionId)
    const latestAttemptsSub = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select('qa2.userId', 'userId')
      .addSelect('qa2.questionId', 'questionId')
      .addSelect('MAX(qa2.id)', 'maxId')
      .from(QuestionAttempt, 'qa2')
      .groupBy('qa2.userId')
      .addGroupBy('qa2.questionId')
      .getQuery();

    // 3) aggregate per user using that latest-attempt set
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('u.id', 'id')
      .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
      .addSelect('u.username', 'username')
      .addSelect('u.image', 'image')
      .addSelect('jr.title', 'designationName')
      .addSelect('SUM(CASE WHEN qa.isCorrect = 1 THEN 1 ELSE 0 END)', 'totalCorrect')
      .addSelect(
        'SUM(CASE WHEN qa.isCorrect = 0 AND qa.selectedOption IS NOT NULL THEN 1 ELSE 0 END)',
        'totalWrong'
      )
      .addSelect('COUNT(qa.id)', 'totalAttempts')
      .from(`(${latestAttemptsSub})`, 'la')
      .innerJoin('question_attempt', 'qa', 'qa.id = la.maxId')
      .innerJoin('user', 'u', 'u.id = la.userId')
      .leftJoin('job_role', 'jr', 'jr.id = u.designation')
      .innerJoin('question', 'q', 'q.id = la.questionId')
      .where('q.subjectId = :subjectId', { subjectId })
      .groupBy('u.id')
      .getRawMany();

    // 4) map, compute metrics, sort & rank
    const mapped = rows.map((row) => {
      const totalCorrect = +row.totalCorrect || 0;
      const totalWrong = +row.totalWrong || 0;
      const totalAttempts = +row.totalAttempts || 0;

      const avgAccuracy =
        totalAttempts > 0 ? Number(((totalCorrect * 100) / totalAttempts).toFixed(1)) : 0;

      const coverage = numTrivia > 0 ? Number(((totalAttempts / numTrivia) * 100).toFixed(1)) : 0;

      const baseScore = generateScore(totalAttempts, totalCorrect, totalWrong); // 0..100
      // include coverage with 20% weight
      const finalScore = Number(((baseScore * 0.8) + (coverage * 0.2)).toFixed(1));

      return {
        id: row.id,
        name: row.name,
        username: row.username,
        image: row.image,
        designationName: row.designationName,
        totalCorrect,
        totalWrong,
        totalAttempts,
        avgAccuracy,   // percent
        coverage,      // percent
        baseScore: Number(baseScore.toFixed(1)),
        score: finalScore
      };
    });

    // sort by final score desc
    mapped.sort((a, b) => b.score - a.score);

    // assign ranks (ties share same rank)
    const ranked: any[] = [];
    let prevScore: number | null = null;
    let rank = 0;
    let itemsSeen = 0;
    for (const m of mapped) {
      itemsSeen++;
      if (prevScore === null || m.score < prevScore) {
        rank = itemsSeen;
      }
      prevScore = m.score;
      ranked.push({ ...m, rank });
    }

    // return top 10
    return ranked.slice(0, 10);
  }

  /** popular topics: unchanged */
  private async getPopularTopics(subjectId: number) {
    const topicsRaw = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'id')
      .addSelect('t.title', 'title')
      .addSelect('t.slug', 'slug')
      .addSelect('t.shortDesc', 'shortDesc')
      .addSelect('t.popularity', 'popularity')
      .from(Topic, 't')
      .where('t.subjectId = :subjectId', { subjectId })
      .orderBy('t.popularity', 'DESC')
      .limit(10)
      .getRawMany();

    return topicsRaw.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      shortDesc: t.shortDesc,
      popularity: +t.popularity,
    }));
  }


  private async getSubjectRatings(subjectId: number, userId: number) {
  const sessions = await this.dataSource
    .getRepository(AssessmentSession)
    .createQueryBuilder('session')
    .leftJoinAndSelect('session.skillRatings', 'rating')
    .leftJoinAndSelect('session.rater', 'rater')
    .where('session.userId = :userId', { userId })
    // Optional filters
    // .andWhere('rating.skillId = :subjectId', { subjectId })
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

  //returns individual skill ratings
    private async getSubjectSkillRatings(subjectId: number, userId: number) {
    const skillRatings = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'id')
      .addSelect('t.skillId', 'skillId')
      .addSelect('t.skillType', 'skillType')
      .addSelect('t.rating', 'rating')
      .addSelect('t.createdAt', 'createdAt')
      .from(SkillRating, 't')
      //.where('t.skillId = :subjectId', { subjectId })
      //.where('t.userId = :userId', { userId })
      .orderBy('t.id', 'DESC')
      .limit(100)
      .getRawMany();

    return skillRatings.map((t) => ({
      id: t.id,
      skillId: t.skillId,
      skillType: t.skillType,
      rating: t.rating,
      createdAt: t.createdAt,
    }));
  }
}