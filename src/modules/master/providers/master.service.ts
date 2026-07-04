import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserPermissionDto } from 'src/common/dto/user-permission.dto';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { AddUserSubjectsDto } from 'src/core/users/dtos/user-subject.dto';
import { DataSource, In, Repository } from 'typeorm';
import { RouteService } from './route.service';
import { SubjectAnalysisService } from './subject-analysis.service';
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

    @InjectRepository(SubjectTrack)
    private readonly subjectTrackRepo: Repository<SubjectTrack>,

    @InjectRepository(CertificationTrack)
    private readonly certificationTrackRepo: Repository<CertificationTrack>,

    private readonly dataSource: DataSource,
    private subjectAnalyzer: SubjectAnalysisService,
    private topicAnalyzer: TopicAnalysisService,
    private readonly routeService: RouteService,
  ) {}

  private async getSubjectTrackCounts(): Promise<Map<number, number>> {
    const rows = await this.subjectTrackRepo
      .createQueryBuilder('st')
      .select('st.subjectId', 'subjectId')
      .addSelect('COUNT(st.id)', 'count')
      .groupBy('st.subjectId')
      .getRawMany();
    return new Map(rows.map((r) => [+r.subjectId, +r.count]));
  }

  private async getCertificationTrackCounts(): Promise<Map<number, number>> {
    const rows = await this.certificationTrackRepo
      .createQueryBuilder('ct')
      .select('ct.jobRoleId', 'jobRoleId')
      .addSelect('COUNT(ct.id)', 'count')
      .groupBy('ct.jobRoleId')
      .getRawMany();
    return new Map(rows.map((r) => [+r.jobRoleId, +r.count]));
  }

  /**
   * Delegates to RouteService for all route logic.
   */
  async getRoutesConfig(
    userRole?: string,
    userPermissions: IUserPermissionDto[] = [],
  ) {
    return this.routeService.getRoutesConfig(userRole, userPermissions);
  }

  async getMasterData(userId: number) {
    const [subjects, jobRoles, popularTopics, subjectTracks, certificationTracks, topics] = await Promise.all([
      this.subjectAnalyzer.getAllSubjects(userId),
      this.getJobRolesWithSubjects(userId),
      this.getPopularTopics(),
      this.getMasterSubjectTracks(),
      this.getMasterCertificationTracks(),
      this.getTopicsForDropdown(),
    ]);

    return { subjects, jobRoles, popularTopics, subjectTracks, certificationTracks, topics };
  }

  private async getTopicsForDropdown() {
    const rows = await this.topicRepo
      .createQueryBuilder('t')
      .select(['t.id AS id', 't.title AS title', 't.slug AS slug', 't.subjectId AS subjectId'])
      .where('t.isPublished = :isPublished', { isPublished: 1 })
      .orderBy('t.subjectId', 'ASC')
      .addOrderBy('t.title', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id,
      title: r.title,
      slug: r.slug,
      subjectId: +r.subjectId,
    }));
  }

  private async getMasterSubjectTracks() {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('st.id', 'id')
      .addSelect('st.subjectId', 'subjectId')
      .addSelect('st.title', 'title')
      .addSelect('st.slug', 'slug')
      .addSelect('st.sortOrder', 'sortOrder')
      .addSelect('st.isPublished', 'isPublished')
      .addSelect('s.title', 'subjectName')
      .addSelect('COUNT(stt.id)', 'topicCount')
      .from('subject_track', 'st')
      .innerJoin('subject', 's', 's.id = st.subjectId')
      .leftJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
      .groupBy('st.id')
      .orderBy('st.subjectId', 'ASC')
      .addOrderBy('st.sortOrder', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id,
      subjectId: +r.subjectId,
      subjectName: r.subjectName,
      title: r.title,
      slug: r.slug,
      sortOrder: +r.sortOrder,
      isPublished: Boolean(r.isPublished),
      topicCount: +r.topicCount,
    }));
  }

  private async getMasterCertificationTracks() {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('ct.id', 'id')
      .addSelect('ct.jobRoleId', 'jobRoleId')
      .addSelect('ct.title', 'title')
      .addSelect('ct.sortOrder', 'sortOrder')
      .addSelect('ct.isPublished', 'isPublished')
      .addSelect('jr.title', 'jobRoleTitle')
      .addSelect('COUNT(ctst.id)', 'subjectTrackCount')
      .from('certification_track', 'ct')
      .innerJoin('job_role', 'jr', 'jr.id = ct.jobRoleId')
      .leftJoin('certification_track_subject_track', 'ctst', 'ctst.certificationTrackId = ct.id')
      .groupBy('ct.id')
      .orderBy('ct.jobRoleId', 'ASC')
      .addOrderBy('ct.sortOrder', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id,
      jobRoleId: +r.jobRoleId,
      jobRoleTitle: r.jobRoleTitle,
      title: r.title,
      sortOrder: +r.sortOrder,
      isPublished: Boolean(r.isPublished),
      subjectTrackCount: +r.subjectTrackCount,
    }));
  }

  async getPopularTopics(limit = 10) {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'id')
      .addSelect('t.title', 'title')
      .addSelect('t.slug', 'slug')
      .addSelect('t.subjectId', 'subjectId')
      .addSelect('s.title', 'subjectName')
      .addSelect('COUNT(qa.id)', 'totalAttempts')
      .from('topic', 't')
      .innerJoin('subject', 's', 's.id = t.subjectId')
      .innerJoin('question_topic', 'qt', 'qt.topicId = t.id')
      .innerJoin('question', 'q', 'q.id = qt.questionId')
      .innerJoin('question_attempt', 'qa', 'qa.questionId = q.id')
      .where('t.isPublished = :isPublished', { isPublished: 1 })
      .groupBy('t.id')
      .orderBy('COUNT(qa.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id,
      title: r.title,
      slug: r.slug,
      subjectId: +r.subjectId,
      subjectName: r.subjectName,
      totalAttempts: +r.totalAttempts,
    }));
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
            status: `Subject already added: ${
              existing.find((e) => e.subjectId === subjectId)?.subject.title
            }`,
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

  async getUserQuizStats(userId: number) {
    const [subjects, topics] = await Promise.all([
      this.subjectAnalyzer.getAllSubjects(userId),
      this.topicAnalyzer.getAllTopicStats(userId),
    ]);

    const subjectMap = new Map<number, any>();
    for (const subject of subjects) {
      subjectMap.set(subject.id, { ...subject, topics: [] });
    }
    for (const topic of topics) {
      if (topic.subjectId && subjectMap.has(topic.subjectId)) {
        subjectMap.get(topic.subjectId).topics.push(topic);
      }
    }

    return Array.from(subjectMap.values());
  }

  async getJobRolesWithSubjectsWithoutUser(userId?: number) {
    const [jobRoles, certCounts, subjectTrackCounts] = await Promise.all([
      this.jobRoleRepo
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
          'subject.description',
          'subject.image',
        ])
        .getMany(),
      this.getCertificationTrackCounts(),
      this.getSubjectTrackCounts(),
    ]);

    return jobRoles.map((jr) => ({
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
      certificationTrackCount: certCounts.get(jr.id) ?? 0,
      subjects: jr.jobRoleSubjects.map((jrs) => ({
        id: jrs.subject.id,
        title: jrs.subject.title,
        image: jrs.subject.image,
        description: jrs.subject.description,
        subjectTrackCount: subjectTrackCounts.get(jrs.subject.id) ?? 0,
      })),
    }));
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
        'subject.image',
      ])
      .where('jobRole.isPublished = :isPublished', { isPublished: 1 })
      .orderBy('jobRole.orderId', 'ASC');

    if (userId) {
      qb.addSelect(
        `CASE WHEN user.designation = jobRole.id THEN 1 ELSE 0 END`,
        'isSubscribed',
      ).leftJoin(User, 'user', 'user.id = :userId', { userId });
    } else {
      qb.addSelect('FALSE', 'isSubscribed');
    }

    const [jobRoles, certCounts, subjectTrackCounts] = await Promise.all([
      qb.getRawAndEntities(),
      this.getCertificationTrackCounts(),
      this.getSubjectTrackCounts(),
    ]);

    // Build a map from jobRole.id → first raw row (for isSubscribed)
    const rawByJobRoleId = new Map<number, any>();
    for (const raw of jobRoles.raw) {
      if (!rawByJobRoleId.has(+raw.jobRole_id)) {
        rawByJobRoleId.set(+raw.jobRole_id, raw);
      }
    }

    return jobRoles.entities.map((jr) => {
      const raw = rawByJobRoleId.get(jr.id);
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
        isSubscribed: Boolean(Number(raw?.isSubscribed)),
        coverage: 0,
        score: 0,
        userId,
        certificationTrackCount: certCounts.get(jr.id) ?? 0,
        subjects: jr.jobRoleSubjects.map((jrs) => ({
          id: jrs.subject.id,
          title: jrs.subject.title,
          slug: jrs.subject.slug,
          image: jrs.subject.image,
          subjectTrackCount: subjectTrackCounts.get(jrs.subject.id) ?? 0,
        })),
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
