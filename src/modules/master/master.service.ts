import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,

    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,

    private readonly dataSource: DataSource
  ) { }

  async getMasterData(userId: number) {
    const subjects = await this.getSubjectStatsForUser(userId);
    const topics = await this.getTopicStatsForUser(userId);
    const jobRoles = await this.getJobRolesWithSubjects(userId);
    //TopicListItemDto[]

    return {
      subjects: subjects,
      jobRoles: jobRoles,
      topics: topics
    };
  }

  async getSubjectStatsForUser(userId?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'subjectId')
      .addSelect('s.title', 'subjectTitle')
      .addSelect('s.description', 'description')
      .addSelect('s.image', 'image')
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
        .leftJoin(
          'question_attempt',
          'qa',
          'qa.questionId = q.id AND qa.userId = :userId',
          { userId }
        );
    } else {
      // provide defaults in select (so DB always returns columns)
      qb
        .addSelect('0', 'attempted')
        .addSelect('0', 'correct')
        .addSelect('0', 'wrong')
        .addSelect('0', 'skipped');
    }

    const result = await qb.getRawMany();

    return result.map((row) => ({
      id: +row.subjectId,
      title: row.subjectTitle,
      description: row.description,
      image: row.image,
      isPublished: row.isPublished,
      color: row.color,
      numQuestions: +row.numQuestions || 0,
      numTrivia: +row.numTrivia || 0,
      attempted: +row.attempted || 0,
      correct: +row.correct || 0,
      wrong: +row.wrong || 0,
      skipped: +row.skipped || 0,
    }));
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
    const subjects = await this.getSubjectStatsForUser(userId);
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

  /*
  Workable when direct relationships are established in entities
  *
   async findAllSubjectsWithJobRoles() {
    const subjects = await this.subjectRepo.find({
      relations: ['jobRoles'],
    });

    // Map jobRoles to roles array of titles
    return subjects.map(subject => ({
      id: subject.id,
      title: subject.title,
      description: subject.description,
      image: subject.image,
      roles: subject.jobRoles.map(role => role.title),
    }));
  }
   */

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
        image: jrs.subject.image
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
      'subject.image'
    ]);

  if (userId) {
    qb.addSelect('user.designation', 'userDes');
    // join with user table to check subscription
    qb.addSelect(
      `CASE WHEN user.designation = jobRole.id THEN TRUE ELSE FALSE END`,
      'isSubscribed'
    ).leftJoin('user', 'user', 'user.id = :userId', { userId });
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
      isSubscribed: !!raw.isSubscribed,
      coverage: 0,
      score: 0,
      subjects: jr.jobRoleSubjects.map(jrs => ({
        id: jrs.subject.id,
        title: jrs.subject.title,
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
