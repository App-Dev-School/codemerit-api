import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [SubjectsModule, QuestionModule, TopicsModule],
})
export class DomainModule {}
