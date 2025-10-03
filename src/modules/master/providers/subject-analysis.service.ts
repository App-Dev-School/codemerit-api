import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { generateScore } from 'src/common/utils/common-functions';
import { DataSource, Repository } from 'typeorm';
import { TopicAnalysisService } from './topic-analysis.service';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';

@Injectable()
export class SubjectAnalysisService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(JobRoleSubject)
    private jobRoleSubjectRepo: Repository<JobRoleSubject>,

    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,

    @InjectRepository(UserSubject)
    private readonly userSubjectRepo: Repository<UserSubject>,

    private readonly dataSource: DataSource,
    private topicAnalyzer: TopicAnalysisService
  ) { }

  /**
   * Core query for subject stats.
   * - If subjectId provided -> returns one row (getRawOne).
   * - Else returns all subjects (getRawMany).
   *
   * Uses latest-attempt-per-question logic (subquery) when userId is provided,
   * so counts are per-question (not per-attempt row).
   */
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
        'numTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :easy THEN q.id END)', 'numEasyTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :medium THEN q.id END)', 'numIntTrivia')
      .addSelect('COUNT(DISTINCT CASE WHEN q.status = :active AND q.level = :hard THEN q.id END)', 'numAdvTrivia')
      .from(Subject, 's')
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .setParameter('active', QuestionStatusEnum.Active)
      .setParameter('easy', DifficultyLevelEnum.Easy)
      .setParameter('medium', DifficultyLevelEnum.Intermediate)
      .setParameter('hard', DifficultyLevelEnum.Advanced)
      .groupBy('s.id');

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
      popularTopics: []
    };

    if (fullData) {
      // Pass subjectId to both calls; getMeritList computes its own numTrivia.
      [dashboard.meritList, dashboard.syllabus, dashboard.popularTopics] = await Promise.all([
        this.getMeritList(subjectId),
        this.topicAnalyzer.getTopicStatsBySubject(subjectId, userId),
        this.getPopularTopics(subjectId)
      ]);
    }

    return dashboard;
  }

  /** all subjects (master) — minimal fields */
  async getAllSubjects(userId?: number) {
    const rows = await this.getSubjectStats(undefined, userId);
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
      isSubscribed: r.isSubscribed === 1 || r.isSubscribed === '1'
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
    // Step 1: Get the user with designation (job role id)
    const user = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.designation'])
      .where('u.id = :userId', { userId })
      .getOne();

    if (!user?.designation) return [];

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
}