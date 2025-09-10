import { HttpStatus, Injectable } from '@nestjs/common';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class QuizResultService {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  async getQuizResultByCode(resultCode: string) {
    // 1) Fetch base quiz result with quiz + user
    const base = await this.dataSource
      .createQueryBuilder()
      .select('r.id', 'resultId')
      .addSelect('r.resultCode', 'resultCode')
      .addSelect('r.quizId', 'quizId')
      .addSelect('r.userId', 'userId')
      .addSelect('r.total', 'totalQuestions')
      .addSelect('r.correct', 'correctAnswers')
      .addSelect('r.wrong', 'wrongAnswers')
      .addSelect('r.unanswered', 'unanswered')
      .addSelect('r.score', 'score')
      .addSelect('r.remarks', 'remarks')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('q.title', 'quizTitle')
      .addSelect('q.description', 'quizDescription')
      .addSelect('q.slug', 'quizSlug')
      .addSelect('q.quizType', 'quizType')
      .addSelect('u.id', 'uId')
      .addSelect('u.firstName', 'uFirstName')
      .addSelect('u.lastName', 'uLastName')
      .addSelect('u.username', 'uUsername')
      .from(QuizResult, 'r')
      .innerJoin(Quiz, 'q', 'q.id = r.quizId')
      .innerJoin(User, 'u', 'u.id = r.userId')
      .where('r.resultCode = :resultCode', { resultCode })
      .getRawOne();

    if (!base) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, 'Result not found');
    }

    // 2) Aggregate topic-wise stats based on attempts tied to quizId
    const topicRows = await this.dataSource
      .createQueryBuilder()
      .select('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('COUNT(DISTINCT qq.questionId)', 'asked')
      // answered: user has an attempt for this quiz and did not skip
      .addSelect(
        `SUM(CASE WHEN qa.id IS NOT NULL AND (qa.isSkipped = 0 OR qa.isSkipped IS NULL) THEN 1 ELSE 0 END)`,
        'answered'
      )
      // correct: attempt marked correct
      .addSelect(
        `SUM(CASE WHEN qa.id IS NOT NULL AND qa.isCorrect = 1 THEN 1 ELSE 0 END)`,
        'correct'
      )
      .from(QuizQuestion, 'qq')
      .innerJoin(QuestionTopic, 'qt', 'qt.questionId = qq.questionId')
      .innerJoin(Topic, 't', 't.id = qt.topicId')
      .leftJoin(
        QuestionAttempt,
        'qa',
        'qa.questionId = qq.questionId AND qa.quizId = :quizId AND qa.userId = :userId',
      )
      .where('qq.quizId = :quizId', { quizId: base.quizId })
      .groupBy('t.id')
      .addGroupBy('t.title')
      .setParameters({
        quizId: base.quizId,
        userId: base.userId,
      })
      .getRawMany();

    // 3) Map results
    const topics = topicRows.map((r) => {
      const asked = Number(r.asked) || 0;
      const answered = Number(r.answered) || 0;
      const correct = Number(r.correct) || 0;
      const coverage = asked ? +((answered / asked) * 100).toFixed(1) : 0;
      const accuracy = answered ? +((correct / answered) * 100).toFixed(1) : 0;
     
      return {
        id: Number(r.topicId),
        title: r.topicTitle,
        asked,
        answered,
        correct,
        coverage,
        accuracy
      };
    });

    // 4) Final response
    return {
      resultCode: base.resultCode,
      score: Number(base.score) ?? 0,
      accuracy: Number(base.accuracy) ?? 0,
      total: Number(base.totalQuestions) ?? 0,
      correct: Number(base.correctAnswers) ?? 0,
      wrong: Number(base.wrongAnswers) ?? 0,
      unanswered: Number(base.unanswered) ?? 0,
      remarks: base.remarks ?? "",
      createdAt: base.createdAt,
      user: {
        id: Number(base.uId),
        firstName: base.uFirstName,
        lastName: base.uLastName,
        username: base.uUsername,
      },
      quiz: {
        id: Number(base.quizId),
        title: base.quizTitle,
        description: base.quizDescription,
        slug: base.quizSlug,
        quizType: base.quizType
      },
      topics,
    };
  }

}
