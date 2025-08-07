import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { TriviaModule } from './trivia/trivia.module';
import { SkillRatingModule } from './skill-rating/skill-rating.module';

@Module({
  imports: [SubjectsModule, TriviaModule, TopicsModule, SkillRatingModule],
})
export class DomainModule {}
