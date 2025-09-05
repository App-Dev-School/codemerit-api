import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizController } from './quiz.controller';
import { QuizService } from './providers/quiz.service';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuestionModule } from '../question/question.module';
import { QuestionAttemptService } from './providers/question-attempt.service';
import { QuizResultService } from './providers/quiz-result.service';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { MasterModule } from '../master/master.module';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuestionAttempt, QuizResult, QuizQuestion, QuizSubject, QuizTopic]), QuestionModule, MasterModule],
  providers: [QuizService, QuestionAttemptService, QuizResultService],
  controllers: [QuizController],
  // exports: [QuizService, QuestionService]
})
export class QuizModule {}
