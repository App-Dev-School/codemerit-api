import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionModule } from './question/question.module';
import { QuizModule } from './quiz/quiz.module';
import { PermissionsModule } from './shared-module/permissions.module';

@Module({
  imports: [PermissionsModule, SubjectsModule, QuestionModule, TopicsModule, QuizModule],
})
export class DomainModule { }
