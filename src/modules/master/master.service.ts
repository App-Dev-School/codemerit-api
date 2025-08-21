import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MasterService {
    constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,

    @InjectRepository(JobRole)
    private jobRoleRepo: Repository<JobRole>,

    @InjectRepository(JobRoleSubject)
    private jobRoleSubjectRepo: Repository<JobRoleSubject>,
  ) {}

  async getMasterData() {
    const [subjects, topics, jobRoles] = await Promise.all([
      this.subjectRepo.find(),
      this.topicRepo.find(),
      this.jobRoleRepo.find(),
    ]);

    return {
      subjects,
      topics,
      jobRoles,
    };
  }

 //With help of joining table jobRoleSubject
  async findSubjectsWithRoles() {
  const qb = this.jobRoleSubjectRepo.createQueryBuilder('jrs')
    .leftJoinAndSelect('jrs.subject', 'subject')
    .leftJoinAndSelect('jrs.jobRole', 'jobRole');

  const results = await qb.getMany();

  const grouped = results.reduce((acc, jrs) => {
    const subjId = jrs.subject.id;

    if (!acc[subjId]) {
      acc[subjId] = {
        id: jrs.subject.id,
        title: jrs.subject.title,
        description: jrs.subject.description,
        image: jrs.subject.image,
        roles: [],
      };
    }

    if (jrs.jobRole?.title && !acc[subjId].roles.includes(jrs.jobRole.title)) {
      acc[subjId].roles.push(jrs.jobRole.title);
    }

    return acc;
  }, {} as Record<number, any>);

  return Object.values(grouped);
}

 async getAllJobRolesWithSubjects() {
    const jobRoleSubjects = await this.jobRoleSubjectRepo.find({
      relations: ['jobRole', 'subject'],
    });

    const result = new Map<number, {
      id: number;
      title: string;
      subjects: {
        id: number;
        title: string;
        description: string;
        image: string
      }[];
    }>();

    for (const jrs of jobRoleSubjects) {
      const jobRoleId = jrs.jobRole.id;
      const subject = jrs.subject;

      if (!result.has(jobRoleId)) {
        result.set(jobRoleId, {
          id: jobRoleId,
          title: jrs.jobRole.title,
          subjects: [],
        });
      }

      result.get(jobRoleId).subjects.push({
        id: subject.id,
        title: subject.title,
        description: subject.description,
        image: subject.image
      });
    }

    return Array.from(result.values());
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
}
