import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { In, Repository } from 'typeorm';
import { SubjectItemDto } from '../subjects/dtos/subject-item.dto';
import { TopicListItemDto } from '../topics/dtos/topic-list.dto';

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
  ) { }

  async getMasterData() {
    const topics = await this.topicRepo
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.subject', 'subject')
      .select([
        'topic.id',
        'topic.title',
        'topic.slug',
        'topic.isPublished',
        'subject.id',
        'subject.title',
      ])
      .where('topic.isPublished = :isPublished', { isPublished: true })
      .getMany();

    let topicsResponse: TopicListItemDto[] = [];
    for (const topic of topics) {
      const topicDto = new TopicListItemDto();
      topicDto.id = topic.id;
      topicDto.title = topic.title;
      topicDto.subjectId = topic.subject.id;
      topicDto.subjectName = topic.subject.title;
      topicDto.isPublished = topic.isPublished;
      topicDto.description = topic.description;
      topicDto.isSubscribed = false;
      topicDto.coverage = 0;
      topicDto.slug = topic.slug;
      topicsResponse.push(topicDto);
    }

    const subjects = await this.subjectRepo
      .createQueryBuilder('subject')
      .select([
        'subject.id',
        'subject.title',
        'subject.description',
        'subject.isPublished',
        'subject.image',
        'subject.color',
      ])
      .where('subject.isPublished = :isPublished', { isPublished: true })
      .getMany();

    let subjectsResponse: SubjectItemDto[] = [];
    for (const subject of subjects) {
      const subjectDto = new SubjectItemDto();
      subjectDto.id = subject.id;
      subjectDto.title = subject.title;
      subjectDto.description = subject.description;
      subjectDto.image = subject.image;
      subjectDto.isPublished = subject.isPublished;
      subjectDto.color = subject.color;
      subjectDto.coverage = 0;
      subjectsResponse.push(subjectDto);
    }

    return {
      subjects: subjectsResponse,
      jobRoles: this.getJobRolesWithSubjects(),
      topics: topicsResponse
    };
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

  async getJobRolesWithSubjects() {
    const jobRoles = await this.jobRoleRepo
      .createQueryBuilder('jobRole')
      .leftJoinAndSelect('jobRole.jobRoleSubjects', 'jrs')
      .leftJoinAndSelect('jrs.subject', 'subject')
      .select([
        'jobRole.id',
        'jobRole.title',
        'jobRole.slug',
        'jobRole.description',
        'jobRole.color',
        'jrs.id', // Optional: if you want the join ID
        'subject.id',
        'subject.title',
        'subject.image'
      ])
      .getMany();

    //   id: role.id,
    //   title: role.title,
    //   slug: role.slug,
    //   subjects: role.jobRoleSubjects.map(jrs => ({
    //     id: jrs.subject.id,
    //     title: jrs.subject.title,
    //     image: jrs.subject.image
    //   }))
    // }));
    //return jobRoles;
    const result = jobRoles.map(jr => ({
      id: jr.id,
      title: jr.title,
      description: jr.description,
      slug: jr.slug,
      color: jr.color,
      subjects: jr.jobRoleSubjects.map(jrs => ({
        id: jrs.subject.id,
        title: jrs.subject.title,
        image: jrs.subject.image
      }))
    }));
    return result;
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
