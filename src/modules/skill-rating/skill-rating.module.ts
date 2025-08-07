import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillRatingService } from './providers/skill-rating.service';
import { SkillRatingController } from './skill-rating.controller';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillRating, AssessmentSession, Subject]),
    TopicsModule,
  ],
  providers: [SkillRatingService],
  controllers: [SkillRatingController],
})
export class SkillRatingModule {}
