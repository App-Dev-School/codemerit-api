import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './providers/topics.service';
import { Topic } from './topic.entity';
import { TagsController } from './topics.controller';

@Module({
  controllers: [TagsController],
  imports: [TypeOrmModule.forFeature([Topic])],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
