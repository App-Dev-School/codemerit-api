// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './providers/admin.service';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subject, Topic, Question, Quiz, QuestionAttempt])],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}