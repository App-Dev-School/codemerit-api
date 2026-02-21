import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermissionService } from './providers/user-permission.service';
import { UserPermissionController } from './user-permission.controller';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, UserPermission, Subject, Topic, User]),
  ],
  providers: [UserPermissionService],
  controllers: [UserPermissionController],
  exports: [UserPermissionService],
})
export class UserPermissionModule { }
