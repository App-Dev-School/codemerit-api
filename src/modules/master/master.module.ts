import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { MasterController } from './master.controller';
import { MasterService } from './providers/master.service';
import { RouteService } from './providers/route.service';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { TopicAnalysisService } from './providers/topic-analysis.service';
import { SubjectAnalysisService } from './providers/subject-analysis.service';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { UserPermissionModule } from '../user-permission/user-permission.module';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, JobRole, UserJobRole, Subject, JobRoleSubject, Topic, UserSubject, UserPermission]), UserPermissionModule],
  controllers: [MasterController],
  providers: [MasterService, SubjectAnalysisService, TopicAnalysisService, RouteService],
  exports: [MasterService, SubjectAnalysisService, TopicAnalysisService, RouteService]
})
export class MasterModule {}
