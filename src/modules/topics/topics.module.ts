import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { TopicsService } from './providers/topics.service';
import { TopicsController } from './topics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Topic])],
  providers: [TopicsService],
  controllers: [TopicsController],
})
export class TopicsModule {}
