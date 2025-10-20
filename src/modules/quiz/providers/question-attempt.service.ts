import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionService } from 'src/modules/question/providers/question.service';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';

@Injectable()
export class QuestionAttemptService {
  constructor(
    @InjectRepository(QuestionAttempt)
    private questionAttemptRepository: Repository<QuestionAttempt>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    private questionService: QuestionService,
  ) { }

  //quiz analytics
  async fetchQuizAnalyticsBySlug(slug: string): Promise<any> {
    const quiz = await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.quizQuestions', 'quizQuestion')
      .leftJoinAndSelect('quizQuestion.question', 'question')
      .leftJoinAndSelect('question.attempts', 'attempts')
      .leftJoinAndSelect('quiz.questionAttempts', 'quizAttempts')
      .where('quiz.slug = :slug', { slug })
      .getOne();

    if (!quiz) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, `Quiz not found.`);
    }

    if (!quiz.quizQuestions || quiz.quizQuestions.length === 0) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'No questions found for this quiz.'
      );
    }

    // Shape questions
    const questionIds = quiz.quizQuestions.map((qq) => qq.questionId);

    //verify this
    const questions = await this.questionService.getQuestionsFromQIds({
      questionIds,
      numQuestions: quiz.quizQuestions.length
    });

    // Quiz-level stats
    const totalAttempts = quiz.questionAttempts?.length || 0;
    const totalQuestions = questions.length;

    return {
      ...quiz,
      stats: {
        totalQuestions,
        totalAttempts,
        avgAttemptsPerQuestion:
          totalQuestions > 0 ? totalAttempts / totalQuestions : 0,
      },
      questions,
    };
  }

}
