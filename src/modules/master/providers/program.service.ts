import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { generateScore } from 'src/common/utils/common-functions';
import { DataSource, Repository } from 'typeorm';
import { MeritService } from './merit.service';
import { SubjectStatsService } from './subject-stats.service';
import { TopicAnalysisService } from './topic-analysis.service';

// ─── Completion thresholds ────────────────────────────────────────────────────
const TOPIC_DONE = 70;        // coverage % to mark topic complete
const TRACK_DONE = 70;        // % of topics done to mark subject track complete
const CERT_ACHIEVED = 80;     // % of subject tracks done to achieve a cert

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(JobRole)
    private readonly jobRoleRepo: Repository<JobRole>,

    @InjectRepository(SubjectTrack)
    private readonly subjectTrackRepo: Repository<SubjectTrack>,

    private readonly dataSource: DataSource,
    private readonly subjectStats: SubjectStatsService,
    private readonly topicAnalyzer: TopicAnalysisService,
    private readonly meritService: MeritService,
  ) {}

  // ─── Shared Private Fetchers ──────────────────────────────────────────────────

  private async fetchJobRoleBySlug(slug: string) {
    const jr = await this.jobRoleRepo.findOne({
      where: { slug, isPublished: true },
      select: ['id', 'title', 'slug', 'image', 'color', 'description', 'body', 'scope'],
    });
    if (!jr) throw new NotFoundException('Program not found');
    return jr;
  }

  private async fetchUserJobRoles(userId: number) {
    return this.dataSource
      .createQueryBuilder()
      .select('jr.id', 'id')
      .addSelect('jr.title', 'title')
      .addSelect('jr.slug', 'slug')
      .addSelect('jr.image', 'image')
      .addSelect('jr.color', 'color')
      .addSelect('jr.description', 'description')
      .addSelect('jr.orderId', 'orderId')
      .from(JobRole, 'jr')
      .innerJoin('user_job_role', 'ujr', 'ujr.jobRoleId = jr.id')
      .where('ujr.userId = :userId', { userId })
      .andWhere('jr.isPublished = 1')
      .orderBy('jr.orderId', 'ASC')
      .getRawMany();
  }

  private async fetchRoleSubjects(jobRoleIds: number[]) {
    return this.dataSource
      .createQueryBuilder()
      .select('jrs.jobRoleId', 'jobRoleId')
      .addSelect('jrs.subjectId', 'subjectId')
      .addSelect('jrs.tag', 'tag')
      .addSelect('jrs.sortOrder', 'sortOrder')
      .addSelect('s.title', 'sTitle')
      .addSelect('s.slug', 'sSlug')
      .addSelect('s.color', 'sColor')
      .addSelect('s.image', 'sImage')
      .addSelect('s.description', 'sDescription')
      .from('job_role_subject', 'jrs')
      .innerJoin('subject', 's', 's.id = jrs.subjectId AND s.isPublished = 1')
      .where('jrs.jobRoleId IN (:...jobRoleIds)', { jobRoleIds })
      .orderBy('jrs.jobRoleId', 'ASC')
      .addOrderBy('jrs.sortOrder', 'ASC')
      .getRawMany();
  }

  /** All subject tracks for the given subjects, each row = one (track, topic) pair. */
  private async fetchSubjectTracksWithTopics(subjectIds: number[]) {
    if (!subjectIds.length) return [];
    return this.dataSource
      .createQueryBuilder()
      .select('st.id', 'stId')
      .addSelect('st.title', 'stTitle')
      .addSelect('st.slug', 'stSlug')
      .addSelect('st.description', 'stDesc')
      .addSelect('st.sortOrder', 'stSortOrder')
      .addSelect('st.subjectId', 'stSubjectId')
      .addSelect('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.slug', 'topicSlug')
      .addSelect('t.label', 'topicLabel')
      .addSelect('t.order', 'topicOrder')
      .from('subject_track', 'st')
      .innerJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
      .innerJoin('topic', 't', 't.id = stt.topicId AND t.isPublished = 1')
      .where('st.subjectId IN (:...subjectIds)', { subjectIds })
      .andWhere('st.isPublished = 1')
      .orderBy('st.subjectId', 'ASC')
      .addOrderBy('st.sortOrder', 'ASC')
      .addOrderBy('t.order', 'ASC')
      .getRawMany();
  }

  /** Cert tracks for the given job role IDs, each row = one (cert, subjectTrack) pair. */
  private async fetchCertTrackHierarchy(jobRoleIds: number[]) {
    if (!jobRoleIds.length) return [];
    return this.dataSource
      .createQueryBuilder()
      .select('ct.id', 'ctId')
      .addSelect('ct.title', 'ctTitle')
      .addSelect('ct.description', 'ctDesc')
      .addSelect('ct.sortOrder', 'ctSortOrder')
      .addSelect('ct.jobRoleId', 'ctJobRoleId')
      .addSelect('st.id', 'stId')
      .addSelect('st.title', 'stTitle')
      .addSelect('st.slug', 'stSlug')
      .addSelect('st.sortOrder', 'stSortOrder')
      .addSelect('st.subjectId', 'stSubjectId')
      .addSelect('s.title', 'stSubjectTitle')
      .addSelect('s.slug', 'stSubjectSlug')
      .from('certification_track', 'ct')
      .innerJoin('certification_track_subject_track', 'ctst', 'ctst.certificationTrackId = ct.id')
      .innerJoin('subject_track', 'st', 'st.id = ctst.subjectTrackId AND st.isPublished = 1')
      .innerJoin('subject', 's', 's.id = st.subjectId')
      .where('ct.jobRoleId IN (:...jobRoleIds)', { jobRoleIds })
      .andWhere('ct.isPublished = 1')
      .orderBy('ct.jobRoleId', 'ASC')
      .addOrderBy('ct.sortOrder', 'ASC')
      .addOrderBy('st.sortOrder', 'ASC')
      .getRawMany();
  }

  // ─── Shared Assembly Helpers ──────────────────────────────────────────────────

  /**
   * Builds a Map<subjectTrackId, computedTrack> from the raw (track, topic) rows
   * and topic stats. Used by both getProgramDetails and getCareerDashboard.
   */
  private buildSubjectTrackMap(
    stRows: any[],
    topicStatsMap: Map<number, any>,
    stMerits: { meritLists: Map<number, any[]>; userRanks: Map<number, number | null> },
    userId?: number,
  ): Map<number, any> {
    // Group rows by subjectTrackId
    type StEntry = { meta: any; topicIds: number[] };
    const stIndex = new Map<number, StEntry>();

    for (const row of stRows) {
      const stId = +row.stId;
      if (!stIndex.has(stId)) {
        stIndex.set(stId, {
          meta: {
            id: stId, title: row.stTitle, slug: row.stSlug,
            description: row.stDesc, sortOrder: +row.stSortOrder,
            subjectId: +row.stSubjectId,
          },
          topicIds: [],
        });
      }
      stIndex.get(stId)!.topicIds.push(+row.topicId);
    }

    const result = new Map<number, any>();

    for (const [stId, { meta, topicIds }] of stIndex) {
      // Build topic cards
      const topics = topicIds.map((tid) => {
        const ts = topicStatsMap.get(tid) ?? {};
        const numTrivia = +ts.numTrivia || 0;
        const attempted = +ts.myUniqueAttempts || 0;
        const allAttempts = +ts.myAllAttempts || 0;
        const correct = +ts.correct || 0;
        const wrong = +ts.wrong || 0;
        const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
        const accuracy = allAttempts > 0 ? +(correct * 100 / allAttempts).toFixed(1) : 0;
        const score = +generateScore(allAttempts, correct, wrong).toFixed(0);
        const isCompleted = coverage >= TOPIC_DONE;

        const base: any = {
          id: tid,
          title: ts.title,
          slug: ts.slug,
          label: ts.label,
          numTrivia,
        };
        if (userId) Object.assign(base, { attempted, correct, wrong, accuracy, coverage, score, isCompleted });
        return base;
      });

      // Aggregate subjectTrack stats
      const stNumTrivia = topics.reduce((s: number, t: any) => s + (t.numTrivia || 0), 0);
      const stAttempted = userId ? topics.reduce((s: number, t: any) => s + (t.attempted || 0), 0) : 0;
      const stAllAttempts = userId ? topicIds.reduce((s: number, tid: number) => s + (+(topicStatsMap.get(tid)?.myAllAttempts) || 0), 0) : 0;
      const stCorrect = userId ? topics.reduce((s: number, t: any) => s + (t.correct || 0), 0) : 0;
      const stWrong = userId ? topics.reduce((s: number, t: any) => s + (t.wrong || 0), 0) : 0;
      const stCoverage = stNumTrivia > 0 ? +((stAttempted / stNumTrivia) * 100).toFixed(1) : 0;
      const stAccuracy = stAllAttempts > 0 ? +(stCorrect * 100 / stAllAttempts).toFixed(1) : 0;
      const stScore = +generateScore(stAllAttempts, stCorrect, stWrong).toFixed(0);
      const totalTopics = topics.length;
      const completedTopics = userId ? topics.filter((t: any) => t.isCompleted).length : 0;
      const progressPercent = totalTopics > 0 ? +((completedTopics / totalTopics) * 100).toFixed(0) : 0;
      const isCompleted = progressPercent >= TRACK_DONE;

      const card: any = {
        ...meta,
        totalTopics,
        numTrivia: stNumTrivia,
        meritList: stMerits.meritLists.get(stId) ?? [],
        topics,
      };

      if (userId) {
        Object.assign(card, {
          attempted: stAttempted, correct: stCorrect, wrong: stWrong,
          coverage: stCoverage, accuracy: stAccuracy, score: stScore,
          completedTopics, progressPercent, isCompleted,
          userRank: stMerits.userRanks.get(stId) ?? null,
        });
      }

      result.set(stId, card);
    }

    return result;
  }

  // ─── Job Roles With Subjects (master data) ────────────────────────────────────

  async getJobRolesWithSubjects(userId?: number) {
    const qb = this.jobRoleRepo
      .createQueryBuilder('jobRole')
      .leftJoinAndSelect('jobRole.jobRoleSubjects', 'jrs')
      .leftJoinAndSelect('jrs.subject', 'subject')
      .select([
        'jobRole.id', 'jobRole.title', 'jobRole.slug', 'jobRole.description',
        'jobRole.image', 'jobRole.isPublished', 'jobRole.color',
        'jrs.id', 'subject.id', 'subject.title', 'subject.slug', 'subject.image',
      ])
      .where('jobRole.isPublished = :isPublished', { isPublished: 1 })
      .orderBy('jobRole.orderId', 'ASC');

    if (userId) {
      qb.addSelect(`CASE WHEN usr.id = :userId THEN 1 ELSE 0 END`, 'isSubscribed')
        .leftJoin(User, 'usr', 'usr.id = :userId', { userId });
    } else {
      qb.addSelect('FALSE', 'isSubscribed');
    }

    const [certCounts, stCounts, { raw: rawRows, entities }] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('ct.jobRoleId', 'jobRoleId')
        .addSelect('COUNT(ct.id)', 'count')
        .from('certification_track', 'ct')
        .groupBy('ct.jobRoleId')
        .getRawMany()
        .then((rows) => new Map(rows.map((r) => [+r.jobRoleId, +r.count]))),
      this.subjectTrackRepo
        .createQueryBuilder('st')
        .select('st.subjectId', 'subjectId')
        .addSelect('COUNT(st.id)', 'count')
        .groupBy('st.subjectId')
        .getRawMany()
        .then((rows) => new Map(rows.map((r) => [+r.subjectId, +r.count]))),
      qb.getRawAndEntities(),
    ]);

    const rawById = new Map<number, any>();
    for (const r of rawRows) {
      if (!rawById.has(+r.jobRole_id)) rawById.set(+r.jobRole_id, r);
    }

    return entities.map((jr) => ({
      id: jr.id,
      title: jr.title,
      slug: jr.slug,
      description: jr.description,
      image: jr.image,
      color: jr.color,
      isPublished: jr.isPublished,
      isSubscribed: Boolean(Number(rawById.get(jr.id)?.isSubscribed)),
      certificationTrackCount: certCounts.get(jr.id) ?? 0,
      subjects: jr.jobRoleSubjects.map((jrs) => ({
        id: jrs.subject.id,
        title: jrs.subject.title,
        slug: jrs.subject.slug,
        image: jrs.subject.image,
        subjectTrackCount: stCounts.get(jrs.subject.id) ?? 0,
      })),
    }));
  }

  // ─── Career Dashboard (authenticated) ────────────────────────────────────────

  async getCareerDashboard(userId: number) {
    const jobRoles = await this.fetchUserJobRoles(userId);

    if (!jobRoles.length) {
      return {
        overallSummary: {
          totalSubjects: 0, overallReadiness: 0,
          totalCertificationTracks: 0, certTracksAchieved: 0,
          certTracksInProgress: 0, certTracksNotStarted: 0,
        },
        jobRoles: [],
      };
    }

    const jobRoleIds = jobRoles.map((jr) => +jr.id);

    const roleSubjectRows = await this.fetchRoleSubjects(jobRoleIds);
    const allSubjectIds = [...new Set(roleSubjectRows.map((rs) => +rs.subjectId))];

    // Parallel fetches
    const [subjectStatsMap, certRows] = await Promise.all([
      this.subjectStats.getSubjectStatsMap(userId),
      this.fetchCertTrackHierarchy(jobRoleIds),
    ]);

    // Fetch cert track topics (certRows don't have topicIds — need separate fetch)
    const certStIds = [...new Set(certRows.map((r) => +r.stId))];
    const stRowsForCerts = certStIds.length
      ? await this.dataSource
          .createQueryBuilder()
          .select('st.id', 'stId').addSelect('st.title', 'stTitle').addSelect('st.slug', 'stSlug')
          .addSelect('st.description', 'stDesc').addSelect('st.sortOrder', 'stSortOrder')
          .addSelect('st.subjectId', 'stSubjectId')
          .addSelect('t.id', 'topicId').addSelect('t.title', 'topicTitle').addSelect('t.slug', 'topicSlug')
          .addSelect('t.label', 'topicLabel').addSelect('t.order', 'topicOrder')
          .from('subject_track', 'st')
          .innerJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
          .innerJoin('topic', 't', 't.id = stt.topicId AND t.isPublished = 1')
          .where('st.id IN (:...certStIds)', { certStIds })
          .orderBy('st.sortOrder').addOrderBy('t.order')
          .getRawMany()
      : [];

    const allCertTopicIds = [...new Set(stRowsForCerts.map((r) => +r.topicId))];
    const topicStatsList = allCertTopicIds.length
      ? await this.topicAnalyzer.getTopicStatsByIds(allCertTopicIds, userId)
      : [];
    const topicStatsMap = new Map<number, any>(topicStatsList.map((t) => [t.id, t]));

    const stMerits = await this.meritService.getSubjectTrackMeritsWithRanks(certStIds, userId);
    const stMap = this.buildSubjectTrackMap(stRowsForCerts, topicStatsMap, stMerits, userId);

    // Index certRows by jobRole
    type CertEntry = { meta: any; stIds: number[] };
    const certByJobRole = new Map<number, Map<number, CertEntry>>();
    for (const row of certRows) {
      const jrId = +row.ctJobRoleId;
      if (!certByJobRole.has(jrId)) certByJobRole.set(jrId, new Map());
      const certMap = certByJobRole.get(jrId)!;
      if (!certMap.has(+row.ctId)) {
        certMap.set(+row.ctId, {
          meta: { id: +row.ctId, title: row.ctTitle, description: row.ctDesc, sortOrder: +row.ctSortOrder },
          stIds: [],
        });
      }
      certMap.get(+row.ctId)!.stIds.push(+row.stId);
    }

    // Index subjects by jobRole
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
        id: +rs.subjectId, title: rs.sTitle, slug: rs.sSlug, color: rs.sColor,
        image: rs.sImage, tag: rs.tag, sortOrder: +rs.sortOrder,
        isSubscribed: raw.isSubscribed === 1 || raw.isSubscribed === '1',
        numQuestions: +raw.numQuestions || 0, numTrivia,
        attempted, correct, wrong, skipped, accuracy, coverage, score,
      });
    }

    // Assemble
    let totalSubjects = 0, totalCerts = 0, certsAchieved = 0, certsInProgress = 0;
    const allReadiness: number[] = [];

    const jobRoleDashboards = jobRoles.map((jr) => {
      const subjects = subjectsByJobRole.get(+jr.id) ?? [];
      totalSubjects += subjects.length;

      const mandatory = subjects.filter((s) => s.tag === 'MANDATORY');
      const scoreSrc = mandatory.length ? mandatory : subjects;
      const readinessScore = scoreSrc.length
        ? +((scoreSrc.reduce((s: number, sub: any) => s + sub.score, 0) / scoreSrc.length)).toFixed(0)
        : 0;
      allReadiness.push(...scoreSrc.map((s: any) => s.score));

      const certMap = certByJobRole.get(+jr.id) ?? new Map<number, CertEntry>();
      const certificationTracks = [...certMap.values()].map(({ meta: ct, stIds }) => {
        const subjectTracks = [...new Set(stIds)].map((stId) => stMap.get(stId)).filter(Boolean);
        const total = subjectTracks.length;
        const completed = subjectTracks.filter((st: any) => st.isCompleted).length;
        const progressPercent = total > 0 ? +((completed / total) * 100).toFixed(0) : 0;
        const isAchieved = progressPercent >= CERT_ACHIEVED;

        totalCerts++;
        if (isAchieved) certsAchieved++;
        else if (completed > 0) certsInProgress++;

        return {
          ...ct,
          totalSubjectTracks: total, completedSubjectTracks: completed,
          progressPercent, isAchieved, achievementThreshold: CERT_ACHIEVED,
          subjectTracks,
        };
      });

      return {
        id: +jr.id, title: jr.title, slug: jr.slug, image: jr.image,
        color: jr.color, description: jr.description,
        readinessScore, subjects, certificationTracks,
      };
    });

    const overallReadiness = allReadiness.length
      ? +((allReadiness.reduce((a, b) => a + b, 0) / allReadiness.length)).toFixed(0)
      : 0;

    return {
      overallSummary: {
        totalSubjects, overallReadiness,
        totalCertificationTracks: totalCerts,
        certTracksAchieved: certsAchieved,
        certTracksInProgress: certsInProgress,
        certTracksNotStarted: totalCerts - certsAchieved - certsInProgress,
      },
      jobRoles: jobRoleDashboards,
    };
  }

  // ─── Program Details (public + optional auth) ─────────────────────────────────

  async getProgramDetails(slug: string, userId?: number) {
    const jobRole = await this.fetchJobRoleBySlug(slug);
    const jobRoleId = jobRole.id;

    // Fetch subjects and their full subject track + topic hierarchy in parallel
    const roleSubjectRows = await this.fetchRoleSubjects([jobRoleId]);
    const subjectIds = roleSubjectRows.map((rs) => +rs.subjectId);

    if (!subjectIds.length) {
      return {
        jobRole: { id: jobRole.id, title: jobRole.title, slug: jobRole.slug, image: jobRole.image, color: jobRole.color, description: jobRole.description, body: (jobRole as any).body, scope: (jobRole as any).scope },
        subjects: [],
        certificationTracks: [],
      };
    }

    const [stRows, certRows, subjectStatsMap, subjectMerits, popularTopicsMap] = await Promise.all([
      this.fetchSubjectTracksWithTopics(subjectIds),
      this.fetchCertTrackHierarchy([jobRoleId]),
      this.subjectStats.getSubjectStatsMap(userId),
      this.meritService.getSubjectMeritsWithRanks(subjectIds, userId),
      this.meritService.getPopularTopicsBySubject(subjectIds),
    ]);

    // Topic stats (if authenticated)
    const allTopicIds = [...new Set(stRows.map((r) => +r.topicId))];
    const topicStatsList = userId && allTopicIds.length
      ? await this.topicAnalyzer.getTopicStatsByIds(allTopicIds, userId)
      : [];
    const topicStatsMap = new Map<number, any>(topicStatsList.map((t) => [t.id, t]));

    // SubjectTrack merits
    const allStIds = [...new Set(stRows.map((r) => +r.stId))];
    const stMerits = await this.meritService.getSubjectTrackMeritsWithRanks(allStIds, userId);

    // Build the central subjectTrack map (shared by subjects and cert views)
    const stMap = this.buildSubjectTrackMap(stRows, topicStatsMap, stMerits, userId);

    // ── Subjects view ──────────────────────────────────────────────────────────
    // Group subject tracks by subjectId
    const stIdsBySubject = new Map<number, number[]>();
    for (const row of stRows) {
      const sid = +row.stSubjectId;
      const arr = stIdsBySubject.get(sid) || [];
      if (!arr.includes(+row.stId)) arr.push(+row.stId);
      stIdsBySubject.set(sid, arr);
    }

    const subjects = roleSubjectRows.map((rs) => {
      const raw = subjectStatsMap.get(+rs.subjectId) ?? {};
      const attempted = +raw.attempted || 0;
      const correct = +raw.correct || 0;
      const wrong = +raw.wrong || 0;
      const skipped = +raw.skipped || 0;
      const numTrivia = +raw.numTrivia || 0;
      const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
      const accuracy = attempted > 0 ? +(correct * 100 / attempted).toFixed(1) : 0;
      const score = +generateScore(attempted, correct, wrong).toFixed(0);

      const subjectTrackIds = stIdsBySubject.get(+rs.subjectId) ?? [];
      const subjectTracks = subjectTrackIds
        .map((stId) => stMap.get(stId))
        .filter(Boolean)
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

      const card: any = {
        id: +rs.subjectId,
        title: rs.sTitle, slug: rs.sSlug, color: rs.sColor,
        image: rs.sImage, description: rs.sDescription,
        tag: rs.tag, sortOrder: +rs.sortOrder,
        numQuestions: +raw.numQuestions || 0, numTrivia,
        meritList: subjectMerits.meritLists.get(+rs.subjectId) ?? [],
        popularTopics: popularTopicsMap.get(+rs.subjectId) ?? [],
        subjectTracks,
      };

      if (userId) {
        Object.assign(card, {
          isSubscribed: raw.isSubscribed === 1 || raw.isSubscribed === '1',
          attempted, correct, wrong, skipped,
          accuracy, coverage, score,
          userRank: subjectMerits.userRanks.get(+rs.subjectId) ?? null,
        });
      }

      return card;
    });

    // ── Certification tracks view ──────────────────────────────────────────────
    type CertEntry = { meta: any; stIds: number[] };
    const certIndex = new Map<number, CertEntry>();
    for (const row of certRows) {
      if (!certIndex.has(+row.ctId)) {
        certIndex.set(+row.ctId, {
          meta: { id: +row.ctId, title: row.ctTitle, description: row.ctDesc, sortOrder: +row.ctSortOrder },
          stIds: [],
        });
      }
      certIndex.get(+row.ctId)!.stIds.push(+row.stId);
    }

    const certificationTracks = [...certIndex.values()]
      .sort((a, b) => a.meta.sortOrder - b.meta.sortOrder)
      .map(({ meta, stIds }) => {
        // Light subjectTrack cards for cert view (no full topic detail)
        const subjectTracks = [...new Set(stIds)].map((stId) => {
          const full = stMap.get(stId);
          if (!full) return null;
          const certRow = certRows.find((r) => +r.stId === stId);
          const light: any = {
            id: full.id, title: full.title, slug: full.slug, sortOrder: full.sortOrder,
            totalTopics: full.totalTopics,
            subject: { id: +certRow.stSubjectId, title: certRow.stSubjectTitle, slug: certRow.stSubjectSlug },
          };
          if (userId) {
            Object.assign(light, { progressPercent: full.progressPercent, isCompleted: full.isCompleted });
          }
          return light;
        }).filter(Boolean);

        const total = subjectTracks.length;
        const completed = userId ? subjectTracks.filter((st: any) => st.isCompleted).length : 0;
        const progressPercent = total > 0 ? +((completed / total) * 100).toFixed(0) : 0;
        const isAchieved = progressPercent >= CERT_ACHIEVED;

        const certCard: any = { ...meta, totalSubjectTracks: total, subjectTracks };
        if (userId) {
          Object.assign(certCard, {
            completedSubjectTracks: completed, progressPercent,
            isAchieved, achievementThreshold: CERT_ACHIEVED,
          });
        }
        return certCard;
      });

    return {
      jobRole: {
        id: jobRole.id, title: jobRole.title, slug: jobRole.slug,
        image: jobRole.image, color: jobRole.color, description: jobRole.description,
        body: (jobRole as any).body, scope: (jobRole as any).scope,
      },
      subjects,
      certificationTracks,
    };
  }
}
