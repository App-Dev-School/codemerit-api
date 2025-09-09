import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { AddUserSubjectsDto } from 'src/core/users/dtos/user-subject.dto';
import { DataSource, In, Repository } from 'typeorm';
import { TopicAnalysisService } from './topic-analysis.service';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,

    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,

    @InjectRepository(UserSubject)
    private readonly userSubjectRepo: Repository<UserSubject>,

    private readonly dataSource: DataSource,
    private topicAnalyzer: TopicAnalysisService
  ) { }

  async getMasterData(userId: number) {
    const subjects = await this.getSubjectStatsMaster(userId);
    const topics = await this.getTopicStatsForUser(userId);
    const jobRoles = await this.getJobRolesWithSubjects(userId);
    //TopicListItemDto[] - Map to exact dtos

    return {
      subjects: subjects,
      jobRoles: jobRoles,
      topics: topics
    };
  }

  async addUserSubjects(userId: number, dto: AddUserSubjectsDto) {
    // get existing subjectIds for this user
    const existing = await this.userSubjectRepo.find({
      where: { userId },
      select: ['subjectId'],
    });
    if (existing.length > 0) {
      const names = existing.map((e) => e.subject.title).join(', ');
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        `Subjects already added for this user: ${names}`,
      );
    }
    const existingIds = new Set(existing.map((us) => us.subjectId));
    const newSubjects = dto.subjectIds
      .filter((id) => !existingIds.has(id))
      .map((subjectId) =>
        this.userSubjectRepo.create({ userId, subjectId }),
      );
    if (newSubjects.length === 0) {
      return [];
    }
    //return this.userSubjectRepo.save(newSubjects);
    try {
      return await this.userSubjectRepo.save(newSubjects);
    } catch (err) {
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add subjects. Please try again later.',
      );
    }
  }

  //returns all subjects with basic detail and stats
  async getSubjectStatsMaster(userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'subjectId')
      .addSelect('s.title', 'subjectTitle')
      .addSelect('s.description', 'description')
      .addSelect('s.image', 'image')
      .addSelect('s.slug', 'slug')
      .addSelect('s.isPublished', 'isPublished')
      .addSelect('s.color', 'color')
      .addSelect('COUNT(DISTINCT q.id)', 'numQuestions')
      .addSelect(
        'COUNT(DISTINCT IF(q.questionType = :questionType, q.id, NULL))',
        'numTrivia'
      )
      .from(Subject, 's')
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .groupBy('s.id');

    if (userId) {
      qb
        .addSelect('COUNT(DISTINCT qa.id)', 'attempted')
        .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
        .addSelect('SUM(CASE WHEN qa.isCorrect = false THEN 1 ELSE 0 END)', 'wrong')
        .addSelect('SUM(CASE WHEN qa.isSkipped = true THEN 1 ELSE 0 END)', 'skipped')
        .addSelect(
          'CASE WHEN us.userId IS NOT NULL THEN 1 ELSE 0 END',
          'isSubscribed')
        .leftJoin(
          'question_attempt',
          'qa',
          'qa.questionId = q.id AND qa.userId = :userId',
          { userId }
        )
        .leftJoin(
          'user_subject',
          'us',
          'us.subjectId = s.id AND us.userId = :userId',
          { userId }
        );
    } else {
      // provide defaults in select (so DB always returns columns)
      qb
        .addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped')
        .addSelect('false', 'isSubscribed');
    }

    const result = await qb.getRawMany();
    return result.map((row) => ({
      id: +row.subjectId,
      title: row.subjectTitle,
      description: row.description,
      image: row.image,
      slug: row.slug || null,
      isPublished: row.isPublished,
      color: row.color,
      numQuestions: +row.numQuestions || 0,
      numTrivia: +row.numTrivia || 0,
      isSubscribed: row.isSubscribed,
      attempted: +row.attempted || 0,
      correct: +row.correct || 0,
      wrong: +row.wrong || 0,
      skipped: +row.skipped || 0
    }));
  }

  //returns one subject full details wrt a userId
  async getSubjectDashboard(subjectId: number, userId?: number, fullData = false) {
    const baseStats = await this.getSubjectBaseStats(subjectId, userId);

    const dashboard: any = {
      ...baseStats,
      meritList: [],
      popularTopics: []
    };
    if (fullData) {
      [dashboard.meritList, dashboard.popularTopics] = await Promise.all([
        this.getMeritList(subjectId),
        this.getPopularTopics(subjectId),
      ]);
    }
    return dashboard;
  }

  private async getSubjectBaseStats(subjectId: number, userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'subjectId')
      .addSelect('s.title', 'subjectTitle')
      .addSelect('s.description', 'description')
      .addSelect('s.image', 'image')
      .addSelect('s.body', 'body')
      .addSelect('s.scope', 'scope')
      .addSelect('s.isPublished', 'isPublished')
      .addSelect('s.color', 'color')
      .addSelect('COUNT(DISTINCT q.id)', 'numQuestions')
      .addSelect(
        'COUNT(DISTINCT IF(q.questionType = :questionType, q.id, NULL))',
        'numTrivia'
      )
      .from(Subject, 's')
      .leftJoin('question', 'q', 'q.subjectId = s.id')
      .where('s.id = :subjectId', { subjectId })
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .groupBy('s.id');

    if (userId) {
      qb.addSelect('COUNT(DISTINCT qa.id)', 'attempted')
        .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
        .addSelect('SUM(CASE WHEN qa.isCorrect = false THEN 1 ELSE 0 END)', 'wrong')
        .addSelect('SUM(CASE WHEN qa.isSkipped = true THEN 1 ELSE 0 END)', 'skipped')
        .addSelect(
          'CASE WHEN us.userId IS NOT NULL THEN 1 ELSE 0 END',
          'isSubscribed'
        )
        .leftJoin(
          'question_attempt',
          'qa',
          'qa.questionId = q.id AND qa.userId = :userId',
          { userId }
        )
        .leftJoin(
          'user_subject',
          'us',
          'us.subjectId = s.id AND us.userId = :userId',
          { userId }
        );
    } else {
      qb.addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped')
        .addSelect('false', 'isSubscribed');
    }

    const row = await qb.getRawOne();
    if (!row) return null;

    const attempted = +row.attempted || 0;
    const correct = +row.correct || 0;
    const wrong = +row.wrong || 0;
    const skipped = +row.skipped || 0;
    const numTrivia = +row.numTrivia || 0;

    // Derived stats directly from the same row
    const coverage = numTrivia > 0 ? attempted / numTrivia : 0;
    const avgAccuracy = Number((attempted > 0 ? correct / attempted : 0).toFixed(1));
    const rawScore = correct * 0.5 + attempted * 0.2 + avgAccuracy * 100 * 0.3;
    const score = Number(rawScore.toFixed(1));

    return {
      id: +row.subjectId,
      title: row.subjectTitle,
      description: row.description,
      image: row.image,
      isPublished: row.isPublished,
      color: row.color,
      body: row.body,
      scope: row.scope,
      numQuestions: +row.numQuestions || 0,
      numTrivia,
      isSubscribed: row.isSubscribed === 1 || row.isSubscribed === '1',
      attempted,
      correct,
      wrong,
      skipped,
      avgAccuracy,
      coverage,
      score,
      meritList: [],
      popularTopics: [],
    };
  }

  private async getMeritList(subjectId: number) {
    const meritListRaw = await this.dataSource
      .createQueryBuilder()
      .select('u.id', 'id')
      .addSelect("CONCAT(u.firstName, ' ', u.lastName)", 'name')
      .addSelect('u.username', 'username')
      .addSelect('u.image', 'image')
      .addSelect('jr.title', 'designationName')
      .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'totalCorrect')
      .addSelect('COUNT(qa.id)', 'totalAttempts')
      .from(QuestionAttempt, 'qa')
      .innerJoin('user', 'u', 'u.id = qa.userId')
      .leftJoin('job_role', 'jr', 'jr.id = u.designation')
      .innerJoin('question', 'q', 'q.id = qa.questionId')
      .where('q.subjectId = :subjectId', { subjectId })
      .groupBy('u.id')
      .getRawMany();

    return meritListRaw
      .map((row) => {
        const totalCorrect = +row.totalCorrect;
        const totalAttempts = +row.totalAttempts;
        const rawAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
        const avgAccuracy = Number(rawAccuracy.toFixed(1));
        const rawScore =
          totalCorrect * 0.5 +
          totalAttempts * 0.2 +
          avgAccuracy * 100 * 0.3;

        const score = Number(rawScore.toFixed(1));
        return {
          id: row.id,
          name: row.name,
          username: row.username,
          image: row.image,
          designationName: row.designationName,
          totalCorrect,
          totalAttempts,
          avgAccuracy,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

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

  async getSubjectDashboardBySlug(slug: string, userId?: number, fullData = false) {
    const subject = await this.dataSource.getRepository(Subject).findOne({
      where: { slug },
      select: ['id'],
    });
    if (!subject) {
      throw new NotFoundException(`Subject not found`);
    }
    return this.getSubjectDashboard(subject.id, userId, fullData);
  }

  //get all my subjects dashboard
  async getSubscribedSubjectDashboards(userId: number, fullData = false) {
    console.log("here with ", userId);
    const subs = await this.dataSource
      .getRepository(UserSubject)
      .createQueryBuilder('us')
      .select('us.subjectId', 'subjectId')
      .where('us.userId = :userId', { userId })
      .getRawMany();

    if (!subs.length) return [];

    const subjectIds = subs.map((s) => +s.subjectId);

    // Call dashboard function for each subscribed subject
    const dashboards = [];
    for (const sid of subjectIds) {
      const dashboard = await this.getSubjectDashboard(sid, userId, fullData);
      if (dashboard) dashboards.push(dashboard);
    }

    return dashboards;
  }

  async getTopicStatsForUser(userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.subjectId', 'subjectId')
      .addSelect('s.title', 'subjectName')
      .addSelect('t.isPublished', 'isPublished')
      .addSelect('t.label', 'label')
      .addSelect('t.slug', 'slug')
      .addSelect('t.description', 'description')
      .addSelect('COUNT(DISTINCT q.id)', 'numQuestions') // total questions in topic
      .addSelect(
        'COUNT(DISTINCT IF(q.questionType = :questionType, q.id, NULL))',
        'numTrivia'
      )
      .from('topic', 't')
      .leftJoin('subject', 's', 's.id = t.subjectId')
      .leftJoin('question_topic', 'qt', 'qt.topicId = t.id')
      .leftJoin('question', 'q', 'q.id = qt.questionId')
      .setParameter('questionType', QuestionTypeEnum.Trivia)
      .groupBy('t.id')
      .addGroupBy('t.subjectId');

    if (userId) {
      qb.addSelect('COUNT(DISTINCT qa.id)', 'attempted')
        .addSelect('SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END)', 'correct')
        .addSelect('SUM(CASE WHEN qa.isCorrect = false THEN 1 ELSE 0 END)', 'wrong')
        .addSelect('SUM(CASE WHEN qa.isSkipped = true THEN 1 ELSE 0 END)', 'skipped')
        .leftJoin(
          'question_attempt',
          'qa',
          'qa.questionId = q.id AND qa.userId = :userId',
          { userId },
        );
    } else {
      // visitors → defaults
      qb.addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped');
    }

    const result = await qb.getRawMany();

    return result.map((row) => ({
      id: +row.topicId,
      title: row.topicTitle,
      subjectId: row.subjectId ? +row.subjectId : null,
      subjectName: row.subjectName ? row.subjectName : null,
      slug: row.slug,
      description: row.description,
      isPublished: row.isPublished || false,
      label: row.label || '',
      numQuestions: +row.numQuestions || 0,
      numTrivia: +row.numTrivia || 0,
      isSubscribed: row.isSubscribed || true,
      coverage: row.coverage || 0,
      attempted: +row.attempted || 0,
      correct: +row.correct || 0,
      wrong: +row.wrong || 0,
      skipped: +row.skipped || 0,
    }));
  }

  //  Combine Subject and Topic Stats
  async getUserQuizStats(userId: number) {
    const subjects = await this.getSubjectStatsMaster(userId);
    const topics = await this.getTopicStatsForUser(userId);

    // Group topics under corresponding subject
    const subjectMap = new Map<number, any>();

    for (const subject of subjects) {
      subjectMap.set(subject.id, {
        ...subject,
        topics: [],
      });
    }

    for (const topic of topics) {
      if (topic.subjectId && subjectMap.has(topic.subjectId)) {
        subjectMap.get(topic.subjectId).topics.push(topic);
      } else {
        // Orphan topics (no subject found) — optional: push them separately
      }
    }

    return Array.from(subjectMap.values());
  }

  async getJobRolesWithSubjectsWithoutUser(userId?: number) {
    const jobRoles = await this.jobRoleRepo
      .createQueryBuilder('jobRole')
      .leftJoinAndSelect('jobRole.jobRoleSubjects', 'jrs')
      .leftJoinAndSelect('jrs.subject', 'subject')
      .select([
        'jobRole.id',
        'jobRole.title',
        'jobRole.slug',
        'jobRole.description',
        'jobRole.image',
        'jobRole.isPublished',
        'jobRole.color',
        'jrs.id', // Optional: if you want the join ID
        'subject.id',
        'subject.title',
        'subject.description',
        'subject.image'
      ])
      .getMany();
    const result = jobRoles.map(jr => ({
      id: jr.id,
      title: jr.title,
      description: jr.description,
      slug: jr.slug,
      image: jr.image,
      color: jr.color,
      isPublished: jr.isPublished,
      numQuestions: 0,
      numusers: 0,
      isSubscribed: true,
      coverage: 0,
      score: 0,
      subjects: jr.jobRoleSubjects.map(jrs => ({
        id: jrs.subject.id,
        title: jrs.subject.title,
        image: jrs.subject.image,
        description: jrs.subject.description
      }))
    }));
    return result;
  }

  async getJobRolesWithSubjects(userId?: number) {
    const qb = this.jobRoleRepo
      .createQueryBuilder('jobRole')
      .leftJoinAndSelect('jobRole.jobRoleSubjects', 'jrs')
      .leftJoinAndSelect('jrs.subject', 'subject')
      .select([
        'jobRole.id',
        'jobRole.title',
        'jobRole.slug',
        'jobRole.description',
        'jobRole.image',
        'jobRole.isPublished',
        'jobRole.color',
        'jrs.id',
        'subject.id',
        'subject.title',
        'subject.slug',
        'subject.image'
      ]);

    if (userId) {
      qb.addSelect(
        `CASE WHEN user.designation = jobRole.id THEN 1 ELSE 0 END`,
        'isSubscribed'
      ).leftJoin(User, 'user', 'user.id = :userId', { userId });
    } else {
      qb.addSelect('FALSE', 'isSubscribed');
    }

    const jobRoles = await qb.getRawAndEntities();

    // Map results
    return jobRoles.entities.map((jr, index) => {
      const raw = jobRoles.raw[index];
      return {
        id: jr.id,
        title: jr.title,
        description: jr.description,
        slug: jr.slug,
        image: jr.image,
        color: jr.color,
        isPublished: jr.isPublished,
        numQuestions: 0,
        numusers: 0,
        isSubscribed: Boolean(Number(raw.isSubscribed)),
        coverage: 0,
        score: 0,
        userId,
        subjects: jr.jobRoleSubjects.map(jrs => ({
          id: jrs.subject.id,
          title: jrs.subject.title,
          slug: jrs.subject.slug,
          image: jrs.subject.image
        }))
      };
    });
  }

  async getTopicListByIds(topicIdsArray: number[]) {
    return this.topicRepo.findBy({
      id: In(topicIdsArray),
    });
  }
  async getSubjectListByIds(subjectIdsArray: number[]) {
    return this.subjectRepo.findBy({
      id: In(subjectIdsArray),
    });
  }
}
