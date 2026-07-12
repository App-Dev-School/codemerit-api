import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { SubjectTrackService } from './providers/subject-track.service';
import { SubjectTrackController } from './subject-track.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectTrack, SubjectTrackTopic, Topic])],
  providers: [SubjectTrackService],
  controllers: [SubjectTrackController],
  exports: [SubjectTrackService],
})
export class SubjectTrackModule {}
