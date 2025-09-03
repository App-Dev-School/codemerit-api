import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionModule } from './question/question.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [SubjectsModule, QuestionModule, TopicsModule, QuizModule],
})
export class DomainModule {}
