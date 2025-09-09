import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { MasterController } from './master.controller';
import { MasterService } from './providers/master.service';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { TopicAnalysisService } from './providers/topic-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobRole, Subject, JobRoleSubject, Topic, UserSubject])],
  controllers: [MasterController],
  providers: [MasterService, TopicAnalysisService],
  exports: [MasterService]
})
export class MasterModule {}
