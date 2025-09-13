import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { MasterModule } from '../master/master.module';
import { UserQuestionService } from '../question/providers/user-question.service';
import { QuestionModule } from '../question/question.module';
import { QuestionAttemptService } from './providers/question-attempt.service';
import { QuizResultService } from './providers/quiz-result.service';
import { QuizService } from './providers/quiz.service';
import { QuizController } from './quiz.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuestionAttempt, QuizResult, QuizQuestion, QuizSubject, QuizTopic]), QuestionModule, MasterModule],
  providers: [QuizService, QuestionAttemptService, QuizResultService],
  controllers: [QuizController],
  // exports: [QuizService, QuestionService]
})
export class QuizModule {}
