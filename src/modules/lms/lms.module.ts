// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { LmsController } from './lms.controller';
import { LmsService } from './providers/lms.service';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { UserPermissionModule } from '../user-permission/user-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Subject,
      Topic,
      Question,
      QuestionAttempt,
      Quiz,
      QuizResult,
    ]),
    UserPermissionModule,
  ],
  providers: [LmsService],
  controllers: [LmsController],
  exports: [LmsService],
})
export class LmsModule {}
