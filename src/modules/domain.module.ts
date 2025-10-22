import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionModule } from './question/question.module';
import { SkillRatingModule } from './skill-rating/skill-rating.module';
import { PermissionsModule } from './shared-module/permissions.module';
import { UserPermissionModule } from './user-permission/user-permission.module';
import { QuizModule } from './quiz/quiz.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AdminModule, PermissionsModule, SubjectsModule, QuestionModule, TopicsModule, QuizModule, UserPermissionModule, SkillRatingModule],
})
export class DomainModule { }
