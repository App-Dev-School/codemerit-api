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
import { generateScore } from 'src/common/utils/common-functions';
import { SubjectAnalysisService } from './subject-analysis.service';

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
    private subjectAnalyzer: SubjectAnalysisService,
    private topicAnalyzer: TopicAnalysisService
  ) { }

  async getMasterData(userId: number) {
    const subjects = await this.subjectAnalyzer.getAllSubjects(userId);
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
    try {
      // get all existing subjects for the user with subject info
      const existing = await this.userSubjectRepo.find({
        where: { userId },
        relations: ['subject'],
        select: ['id', 'subjectId', 'subject'],
      });

      const existingIds = new Set(existing.map((us) => us.subjectId));
      const existingNames = existing.map((us) => us.subject.title);

      const results: { subjectId: number; status: string }[] = [];

      // prepare new subjects
      for (const subjectId of dto.subjectIds) {
        if (existingIds.has(subjectId)) {
          results.push({
            subjectId,
            status: `Subject already added: ${existing.find(
              (e) => e.subjectId === subjectId,
            )?.subject.title}`,
          });
          continue;
        }

        const newUserSubject = this.userSubjectRepo.create({
          userId,
          subjectId,
        });

        await this.userSubjectRepo.save(newUserSubject);
        results.push({
          subjectId,
          status: 'Added successfully',
        });
      }

      if (results.length === 0) {
        return {
          message: 'No new subjects added',
          results,
        };
      }

      return {
        message: 'Subjects processed successfully',
        results,
      };
    } catch (err) {
      throw new AppCustomException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add subjects. Please try again later.',
      );
    }
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
    const subjects = await this.subjectAnalyzer.getAllSubjects(userId);
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
      ])
      .where('jobRole.isPublished = :isPublished', { isPublished: 1 })
      .orderBy('jobRole.orderId', 'ASC');

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
