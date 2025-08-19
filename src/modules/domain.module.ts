import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionModule } from './question/question.module';
import { SkillRatingModule } from './skill-rating/skill-rating.module';

@Module({
  imports: [SubjectsModule, QuestionModule, TopicsModule, SkillRatingModule],
})
export class DomainModule {}
