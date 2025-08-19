import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
