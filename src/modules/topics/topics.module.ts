import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { TopicsService } from './providers/topics.service';
import { TopicsController } from './topics.controller';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Permission, UserPermission])],
  providers: [TopicsService],
  controllers: [TopicsController],
  exports: [TopicsService],
})
export class TopicsModule { }
