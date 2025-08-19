import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, JobRole, JobRoleSubject, Topic])],
  controllers: [MasterController],
  providers: [MasterService]
})
export class MasterModule {}
